import z from "zod";
import type { Configuration } from "../../../../configuration.js";
import { createSignedMessage } from "../../../../crypto.js";
import { FederationPlayerTransferState } from "../../../../generated/prisma/enums.js";
import { checkSignature, checkSignatureResponses } from "../../../../middlewares/checkSignature.js";
import { prisma } from "../../../../prisma.js";
import { zodErrorResponseSchema } from "../../../../schemas.js";
import type { FastifyZodInstance } from "../../../../types.js";

export default (fastify: FastifyZodInstance) => {
  fastify.route({
    method: "POST",
    url: "/federation/v1/transfers/init",
    schema: {
      body: z.object({
        message: z.object({
          requestId: z.uuid(),
          sourceSystemId: z.uuid(),
          targetSystemId: z.uuid(),
          playerId: z.uuid(),
          timestamp: z.coerce.date(),
        }),
        nodeId: z.uuid(),
        signature: z.string(),
      }),
      response: {
        400: z.union([zodErrorResponseSchema, z.object({ error: z.string() })]),
        ...checkSignatureResponses,
        200: z.object({
          message: z.object({
            id: z.string(),
            requestId: z.string(),
            sourceSystemId: z.string(),
            targetSystemId: z.string(),
            playerId: z.string(),
            timestamp: z.iso.datetime(),
          }),
          signature: z.string(),
        }),
        409: z.object({
          error: z.string(),
        }),
      },
    },
    preValidation: [checkSignature],
    handler: async (request, reply) => {
      const config = request.getDecorator<Configuration>("config");
      const { message, nodeId, signature } = request.body;

      if (message.sourceSystemId !== nodeId) {
        return reply.status(400).send({ error: "Only source system can initiate transfer" });
      }

      if (message.targetSystemId !== config.nodeId) {
        return reply.status(400).send({ error: "Only target system can accept transfer" });
      }

      await prisma.federationEvent.create({
        data: {
          eventType: "FEDERATION_TRANSFER_INIT",
          nodeId,
          payload: JSON.stringify(message),
          signature,
        },
      });

      const isRequestIdExists = await prisma.federationPlayerTransfer
        .count({ where: { requestId: message.requestId } })
        .then((count) => count > 0);
      if (isRequestIdExists) {
        return reply.status(409).send({ error: "Transfer with the same requestId already exists" });
      }

      const dbTranfer = await prisma.federationPlayerTransfer.create({
        data: {
          requestId: message.requestId,
          sourceSystemId: message.sourceSystemId,
          targetSystemId: message.targetSystemId,
          playerId: message.playerId,
          state: FederationPlayerTransferState.APPROVED_BY_TARGET,
        },
      });

      return createSignedMessage({ ...dbTranfer, timestamp: dbTranfer.createdAt.toISOString() }, config.privateKey);
    },
  });
};
