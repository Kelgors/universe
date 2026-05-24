import { verify } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { type ZodType, z } from "zod";
import type { Configuration } from "../configuration.js";
import { createSignedMessage } from "../crypto.js";
import { type MessageFns, PayloadError, SignedMessage } from "../generated/universe/federation/v1/base.js";

type SafeDecodeResult<T> = { success: true; data: T } | { success: false; error: string };
function safeDecode<T>(Message: MessageFns<T>, buffer: Buffer, schema: ZodType<T>): SafeDecodeResult<T> {
  try {
    return { success: true, data: schema.parse(Message.decode(buffer)) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: z.prettifyError(error) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error" };
  }
}

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
    return reply
      .status(400)
      .header("content-type", "application/octet-stream")
      .send(
        createSignedMessage(
          PayloadError.encode({
            error: "Invalid message format",
            details: result.error,
            timestamp: Date.now(),
          }).finish(),
          config,
        ),
      );
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
