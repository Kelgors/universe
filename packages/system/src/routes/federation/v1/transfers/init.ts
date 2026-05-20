import z from "zod";
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
        ...checkSignatureResponses,
        200: z.object({
          id: z.string(),
          requestId: z.string(),
          sourceSystemId: z.string(),
          targetSystemId: z.string(),
          playerId: z.string(),
          timestamp: z.iso.datetime(),
        }),
        400: zodErrorResponseSchema,
        409: z.object({
          error: z.string(),
        }),
      },
    },
    preHandler: [checkSignature],
    handler: async (request, reply) => {
      const isRequestIdExists = await prisma.federationPlayerTransfer
        .count({
          where: {
            requestId: request.body.message.requestId,
          },
        })
        .then((count) => count > 0);
      if (isRequestIdExists) {
        return reply.status(409).send({ error: "Transfer with the same requestId already exists" });
      }

      const dbTranfer = await prisma.federationPlayerTransfer.create({
        data: {
          requestId: request.body.message.requestId,
          sourceSystemId: request.body.message.sourceSystemId,
          targetSystemId: request.body.message.targetSystemId,
          playerId: request.body.message.playerId,
          state: FederationPlayerTransferState.APPROVED_BY_TARGET,
        },
      });

      return {
        ...dbTranfer,
        timestamp: dbTranfer.createdAt.toISOString(),
      };
    },
  });
};
