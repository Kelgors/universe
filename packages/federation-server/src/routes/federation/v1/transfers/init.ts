import { safeDecode } from "@universe/game-protocol";
import { type SignedEnveloppe, TransferInitRequest, TransferInitResponse } from "@universe/game-protocol/federation";
import type { Configuration } from "@universe/server-shared";
import { FederationPlayerTransferState } from "@universe/server-shared/prisma/enums.js";
import type { FastifyInstance } from "fastify";
import z from "zod";
import { createSignedEnveloppe } from "../../../../crypto.js";
import {
  onlySourceSystemCanInitiateTransfer,
  onlyTargetSystemCanAcceptTransfer,
  outdatedMessageError,
  transferRequestIdAlreadyExists,
  validationError,
} from "../../../../errors/replies.js";
import { isMessageExpired } from "../../../../helpers/isMessageExpired.js";
import { parseSignedEnveloppe } from "../../../../middlewares/parseSignedEnveloppe.js";
import { saveFederationEvent } from "../../../../middlewares/saveFederationEvent.js";
import { prisma } from "../../../../prisma.js";

const messageSchema = z.object({
  requestId: z.uuid(),
  sourceSystemId: z.uuid(),
  targetSystemId: z.uuid(),
  playerId: z.uuid(),
  timestamp: z.number(),
});

export default (fastify: FastifyInstance) => {
  fastify.route({
    method: "POST",
    url: "/federation/v1/transfers/init",
    preHandler: [parseSignedEnveloppe, saveFederationEvent("FEDERATION_TRANSFER_INIT")],
    handler: async (request, reply) => {
      const config = request.getDecorator<Configuration>("config");
      const enveloppe = request.getDecorator<SignedEnveloppe>("enveloppe");

      const parseResult = safeDecode(TransferInitRequest, enveloppe.message, messageSchema);
      if (!parseResult.success) return validationError(reply, parseResult.error);
      const message = parseResult.data;

      if (isMessageExpired(message.timestamp)) {
        return outdatedMessageError(reply, message.timestamp);
      }

      if (message.sourceSystemId !== enveloppe.nodeId) {
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

      return createSignedEnveloppe(
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
