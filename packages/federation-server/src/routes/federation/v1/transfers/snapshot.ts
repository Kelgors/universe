import { hash } from "node:crypto";
import { safeDecode } from "@universe/game-protocol";
import {
  MobilePlayerData,
  type SignedEnveloppe,
  TransferSnapshotRequest,
  TransferSnapshotResponse,
} from "@universe/game-protocol/federation";
import type { Configuration } from "@universe/server-shared";
import { FederationPlayerTransferState } from "@universe/server-shared/prisma/enums.js";
import type { FastifyInstance } from "fastify";
import z from "zod";
import { createSignedEnveloppe } from "../../../../crypto.js";
import {
  outdatedMessageError,
  snapshotHashNotMatch,
  transferNotApprovedByTarget,
  transferNotFound,
  validationError,
} from "../../../../errors/replies.js";
import { isMessageExpired } from "../../../../helpers/isMessageExpired.js";
import { parseSignedEnveloppe } from "../../../../middlewares/parseSignedEnveloppe.js";
import { saveFederationEvent } from "../../../../middlewares/saveFederationEvent.js";
import { prisma } from "../../../../prisma.js";

const messageSchema = z.object({
  requestId: z.uuid(),
  transferId: z.uuid(),
  snapshotData: z.instanceof(Uint8Array),
  snapshotHash: z.string(),
  timestamp: z.number(),
});

const playerDataSchema = z.object({
  playerId: z.uuid(),
  playerName: z.string(),
});

async function rejectTransfer(requestId: string, transferId: string, cause: string) {
  await prisma.federationPlayerTransfer.update({
    where: { requestId: requestId, id: transferId },
    data: {
      state: FederationPlayerTransferState.REJECTED_BY_TARGET_AT_SNAPSHOT,
      cause,
    },
  });
}

export default (fastify: FastifyInstance) => {
  fastify.route({
    method: "POST",
    url: "/federation/v1/transfers/snapshot",
    preHandler: [parseSignedEnveloppe, saveFederationEvent("FEDERATION_TRANSFER_SNAPSHOT")],
    handler: async (request, reply) => {
      const config = request.getDecorator<Configuration>("config");
      const enveloppe = request.getDecorator<SignedEnveloppe>("enveloppe");

      const parseResult = safeDecode(TransferSnapshotRequest, enveloppe.message, messageSchema);
      if (!parseResult.success) return validationError(reply, parseResult.error);
      const message = parseResult.data;

      if (isMessageExpired(message.timestamp)) {
        return outdatedMessageError(reply, message.timestamp);
      }

      const dbTranfer = await prisma.federationPlayerTransfer.findFirst({
        where: {
          requestId: message.requestId,
          id: message.transferId,
          sourceSystemId: enveloppe.nodeId,
        },
      });
      if (!dbTranfer) {
        return transferNotFound(reply);
      }

      if (dbTranfer.state !== FederationPlayerTransferState.APPROVED_BY_TARGET) {
        return transferNotApprovedByTarget(reply);
      }

      const sha256 = hash("sha256", message.snapshotData);
      if (sha256 !== message.snapshotHash) {
        await rejectTransfer(message.requestId, message.transferId, "Snapshot hash does not match");
        return snapshotHashNotMatch(reply);
      }

      const result = safeDecode(MobilePlayerData, message.snapshotData, playerDataSchema);
      if (!result.success) {
        await rejectTransfer(message.requestId, message.transferId, "Snapshot schema parse error");
        return reply.status(400).send(validationError(reply, result.error));
      }

      await prisma.federationPlayerTransfer.update({
        where: { requestId: message.requestId, id: message.transferId },
        data: {
          snapshot: Uint8Array.from(message.snapshotData),
          state: FederationPlayerTransferState.SNAPSHOT_STAGED_BY_TARGET,
        },
      });

      return reply.status(200).send(
        createSignedEnveloppe(
          TransferSnapshotResponse.encode({
            transferId: message.transferId,
            requestId: message.requestId,
            timestamp: Date.now(),
          }).finish(),
          config,
        ),
      );
    },
  });
};
