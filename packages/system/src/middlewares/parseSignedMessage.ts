import { verify } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { Configuration } from "../configuration.js";
import { createSignedMessage } from "../crypto.js";
import { validationError } from "../errors/replies.js";
import { PayloadError, SignedMessage } from "../generated/universe/federation/v1/base.js";
import { safeDecode } from "../helpers/protobuf.js";

const signedMessageSchema = z.object({
  nodeId: z.uuid(),
  payload: z.instanceof(Buffer),
  signature: z.instanceof(Buffer),
});

export const parseSignedMessage = async (request: FastifyRequest, reply: FastifyReply) => {
  const config = request.getDecorator<Configuration>("config");

  if (!request.headers["content-type"]?.includes("application/octet-stream")) {
    return reply
      .status(400)
      .header("content-type", "application/octet-stream")
      .send(
        createSignedMessage(
          PayloadError.encode({ error: "Invalid content type", timestamp: Date.now() }).finish(),
          config,
        ),
      );
  }
  if (!Buffer.isBuffer(request.body) || request.body.byteLength === 0) {
    return reply
      .status(400)
      .header("content-type", "application/octet-stream")
      .send(
        createSignedMessage(PayloadError.encode({ error: "Missing raw body", timestamp: Date.now() }).finish(), config),
      );
  }

  const result = safeDecode(SignedMessage, request.body, signedMessageSchema);
  if (!result.success) {
    return validationError(reply, result.error, "Invalid message format");
  }
  const message = result.data;
  const node = config.trustedPeers.find((peer) => peer.nodeId === message.nodeId);
  if (!node) {
    return reply
      .status(401)
      .send(
        createSignedMessage(PayloadError.encode({ error: "Unknown node ID", timestamp: Date.now() }).finish(), config),
      );
  }

  if (!verify(null, message.payload, { key: node.publicKey }, message.signature)) {
    return reply
      .status(401)
      .send(
        createSignedMessage(
          PayloadError.encode({ error: "Invalid signature", timestamp: Date.now() }).finish(),
          config,
        ),
      );
  }

  request.setDecorator("message", message);
};
