import z from "zod";
import type { Configuration } from "../../../../configuration.js";
import { createSignedMessage, createSignedMessageSchema } from "../../../../crypto.js";
import { mergeResponseValidationSchema as merge } from "../../../../errors/handler.js";
import {
  onlySourceSystemCanInitiateTransfer,
  onlyTargetSystemCanAcceptTransfer,
  transferRequestIdAlreadyExists,
} from "../../../../errors/replies.js";
import { FederationPlayerTransferState } from "../../../../generated/prisma/enums.js";
import { checkSignature, checkSignatureResponses } from "../../../../middlewares/checkSignature.js";
import { saveFederationEvent } from "../../../../middlewares/saveFederationEvent.js";
import { prisma } from "../../../../prisma.js";
import { defaultServerValidation, errorResponseSchema } from "../../../../schemas.js";
import type { FastifyZodInstance } from "../../../../types.js";

const schema = {
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
  response: merge(defaultServerValidation, checkSignatureResponses, {
    200: createSignedMessageSchema(
      z.object({
        id: z.string(),
        requestId: z.string(),
        sourceSystemId: z.string(),
        targetSystemId: z.string(),
        playerId: z.string(),
        timestamp: z.iso.datetime(),
      }),
    ),
    400: errorResponseSchema,
    409: errorResponseSchema,
  }),
};

export default (fastify: FastifyZodInstance) => {
  fastify.route({
    method: "POST",
    url: "/federation/v1/transfers/init",
    schema,
    preValidation: [checkSignature],
    preHandler: [saveFederationEvent("FEDERATION_TRANSFER_INIT")],
    handler: async (request, reply) => {
      const config = request.getDecorator<Configuration>("config");
      const { message, nodeId: sourceNodeId } = request.body;

      if (message.sourceSystemId !== sourceNodeId) {
        return onlySourceSystemCanInitiateTransfer(reply);
      }

      if (message.targetSystemId !== config.nodeId) {
        return onlyTargetSystemCanAcceptTransfer(reply);
      }

      const isRequestIdExists = await prisma.federationPlayerTransfer
        .count({ where: { requestId: message.requestId } })
        .then((count) => count > 0);
      if (isRequestIdExists) {
        return transferRequestIdAlreadyExists(reply);
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

      return createSignedMessage({ ...dbTranfer, timestamp: dbTranfer.createdAt.toISOString() }, config);
    },
  });
};
