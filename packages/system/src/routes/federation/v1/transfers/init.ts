import z from "zod";
import type { Configuration } from "../../../../configuration.js";
import { createSignedMessage } from "../../../../crypto.js";
import {
  onlySourceSystemCanInitiateTransfer,
  onlyTargetSystemCanAcceptTransfer,
  outdatedMessageError,
  transferRequestIdAlreadyExists,
  validationError,
} from "../../../../errors/replies.js";
import { FederationPlayerTransferState } from "../../../../generated/prisma/enums.js";
import { PayloadError, type SignedMessage } from "../../../../generated/universe/federation/v1/base.js";
import { TransferInitRequest, TransferInitResponse } from "../../../../generated/universe/federation/v1/transfers.js";
import { isMessageExpired } from "../../../../helpers/isMessageExpired.js";
import { parseSignedMessage } from "../../../../middlewares/parseSignedMessage.js";
import { saveFederationEvent } from "../../../../middlewares/saveFederationEvent.js";
import { prisma } from "../../../../prisma.js";
import type { FastifyZodInstance } from "../../../../types.js";

const payloadSchema = z.object({
  requestId: z.uuid(),
  sourceSystemId: z.uuid(),
  targetSystemId: z.uuid(),
  playerId: z.uuid(),
  timestamp: z.number(),
});

export default (fastify: FastifyZodInstance) => {
  fastify.route({
    method: "POST",
    url: "/federation/v1/transfers/init",
    preHandler: [parseSignedMessage, saveFederationEvent("FEDERATION_TRANSFER_INIT")],
    handler: async (request, reply) => {
      const config = request.getDecorator<Configuration>("config");
      const { nodeId: sourceNodeId, payload } = request.getDecorator<SignedMessage>("message");
      const message = TransferInitRequest.decode(payload);

      const parseResult = payloadSchema.safeParse(message);
      if (!parseResult.success) return validationError(reply, parseResult.error);

      if (isMessageExpired(message.timestamp)) {
        return outdatedMessageError(reply, message.timestamp);
      }

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

      return createSignedMessage(
        TransferInitResponse.encode({
          id: dbTranfer.id,
          requestId: dbTranfer.requestId,
          sourceSystemId: dbTranfer.sourceSystemId,
          targetSystemId: dbTranfer.targetSystemId,
          playerId: dbTranfer.playerId,
          timestamp: dbTranfer.createdAt.getTime(),
        }).finish(),
        config,
      );
    },
  });
};
