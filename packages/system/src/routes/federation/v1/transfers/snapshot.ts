import { hash } from "node:crypto";
import z from "zod";
import { createSignedMessageSchema } from "../../../../crypto.js";
import {
  createFastifyValidationError,
  createValidationError,
  mergeResponseValidationSchema as merge,
} from "../../../../errors/handler.js";
import {
  snapshotHashNotMatch,
  snapshotParseError,
  transferNotApprovedByTarget,
  transferNotFound,
} from "../../../../errors/replies.js";
import { FederationPlayerTransferState } from "../../../../generated/prisma/enums.js";
import { safeParse } from "../../../../helpers/json.js";
import {
  checkMessageTimestamp,
  checkMessageTimestampResponses,
} from "../../../../middlewares/checkMessageTimestamp.js";
import { checkSignature, checkSignatureResponses } from "../../../../middlewares/checkSignature.js";
import { saveFederationEvent } from "../../../../middlewares/saveFederationEvent.js";
import { prisma } from "../../../../prisma.js";
import { defaultServerValidation, errorResponseSchema } from "../../../../schemas.js";
import type { FastifyZodInstance } from "../../../../types.js";

const schema = {
  body: createSignedMessageSchema(
    z.object({
      transferId: z.uuid(),
      requestId: z.uuid(),
      snapshot: z.base64(),
      snapshotHash: z.hash("sha256"),
      timestamp: z.coerce.date(),
    }),
  ),
  response: merge(defaultServerValidation, checkSignatureResponses, checkMessageTimestampResponses, {
    204: z.undefined(),
    400: errorResponseSchema,
    404: errorResponseSchema,
  }),
};

export default (fastify: FastifyZodInstance) => {
  fastify.route({
    method: "POST",
    schema,
    url: "/federation/v1/transfers/snapshot",
    preValidation: [checkSignature],
    preHandler: [checkMessageTimestamp, saveFederationEvent("FEDERATION_TRANSFER_SNAPSHOT")],
    handler: async (request, reply) => {
      const { message, nodeId: sourceNodeId } = request.body;

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

      const sha256 = hash("sha256", message.snapshot);
      if (sha256 !== message.snapshotHash) {
        return snapshotHashNotMatch(reply);
      }

      const rawJson = Buffer.from(message.snapshot, "base64").toString();
      const jsonResult = safeParse(rawJson);
      if (!jsonResult.success) {
        return snapshotParseError(reply);
      }

      const result = z.unknown().safeParse(jsonResult.data);
      if (!result.success) {
        return reply.status(400).send(createValidationError(request, createFastifyValidationError(result.error)));
      }

      await prisma.federationPlayerTransfer.update({
        where: { requestId: message.requestId, id: message.transferId },
        data: {
          snapshot: rawJson,
          state: FederationPlayerTransferState.SNAPSHOT_STAGED_BY_TARGET,
        },
      });

      return reply.status(204).send();
    },
  });
};
