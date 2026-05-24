import { hash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import z from "zod";
import {
  outdatedMessageError,
  snapshotHashNotMatch,
  transferNotApprovedByTarget,
  transferNotFound,
  validationError,
} from "../../../../errors/replies.js";
import { FederationPlayerTransferState } from "../../../../generated/prisma/enums.js";
import type { SignedMessage } from "../../../../generated/universe/federation/v1/base.js";
import { MobilePlayerData, TransferSnapshotRequest } from "../../../../generated/universe/federation/v1/transfers.js";
import { isMessageExpired } from "../../../../helpers/isMessageExpired.js";
import { parseSignedMessage } from "../../../../middlewares/parseSignedMessage.js";
import { saveFederationEvent } from "../../../../middlewares/saveFederationEvent.js";
import { prisma } from "../../../../prisma.js";

const requestBodySchema = z.object({
  requestId: z.uuid(),
  transferId: z.uuid(),
  snapshotData: z.instanceof(Buffer),
  snapshotHash: z.string(),
  timestamp: z.number(),
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
    preHandler: [parseSignedMessage, saveFederationEvent("FEDERATION_TRANSFER_SNAPSHOT")],
    handler: async (request, reply) => {
      const { nodeId: sourceNodeId, payload } = request.getDecorator<SignedMessage>("message");
      const message = TransferSnapshotRequest.decode(payload);
      const parseResult = requestBodySchema.safeParse(message);
      if (!parseResult.success) return validationError(reply, parseResult.error);

      if (isMessageExpired(message.timestamp)) {
        return outdatedMessageError(reply, message.timestamp);
      }

      const dbTranfer = await prisma.federationPlayerTransfer.findFirst({
        where: {
          requestId: message.requestId,
          id: message.transferId,
          sourceSystemId: sourceNodeId,
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

      const playerData = MobilePlayerData.decode(message.snapshotData);
      const result = z.unknown().safeParse(playerData);
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

      return reply.status(204).send();
    },
  });
};
