import { verify } from "node:crypto";
import { safeDecode } from "@universe/game-protocol";
import { FederationError, SignedEnveloppe } from "@universe/game-protocol/federation";
import type { Configuration } from "@universe/server-shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createSignedEnveloppe } from "../crypto.js";
import { validationError } from "../errors/replies.js";

const signedEnveloppeSchema = z.object({
  nodeId: z.uuid(),
  message: z.instanceof(Uint8Array),
  signature: z.instanceof(Uint8Array),
});

export const parseSignedEnveloppe = async (request: FastifyRequest, reply: FastifyReply) => {
  const config = request.getDecorator<Configuration>("config");

  if (!request.headers["content-type"]?.includes("application/octet-stream")) {
    return reply
      .status(400)
      .header("content-type", "application/octet-stream")
      .send(
        createSignedEnveloppe(
          FederationError.encode({ code: "Invalid content type", timestamp: Date.now() }).finish(),
          config,
        ),
      );
  }
  if (!(request.body instanceof Uint8Array) || request.body.byteLength === 0) {
    return reply
      .status(400)
      .header("content-type", "application/octet-stream")
      .send(
        createSignedEnveloppe(
          FederationError.encode({ code: "Missing raw body", timestamp: Date.now() }).finish(),
          config,
        ),
      );
  }

  const result = safeDecode(SignedEnveloppe, request.body, signedEnveloppeSchema);
  if (!result.success) {
    return validationError(reply, result.error, "Invalid enveloppe format");
  }
  const enveloppe = result.data;
  const node = config.trustedPeers.find((peer) => peer.nodeId === enveloppe.nodeId);
  if (!node) {
    return reply
      .status(401)
      .send(
        createSignedEnveloppe(
          FederationError.encode({ code: "Unknown node ID", timestamp: Date.now() }).finish(),
          config,
        ),
      );
  }

  if (!verify(null, enveloppe.message, { key: node.publicKey }, enveloppe.signature)) {
    return reply
      .status(401)
      .send(
        createSignedEnveloppe(
          FederationError.encode({ code: "Invalid signature", timestamp: Date.now() }).finish(),
          config,
        ),
      );
  }

  request.setDecorator("enveloppe", enveloppe);
};
