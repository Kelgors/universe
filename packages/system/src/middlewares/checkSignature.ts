import { verify } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import type { Configuration } from "../configuration.js";

const signedMessageSchema = z.object({
  message: z.unknown(),
  nodeId: z.uuid(),
  signature: z.string(),
});

export const checkSignatureResponses = {
  401: z.object({
    error: z.string(),
  }),
};

export const checkSignature = async (request: FastifyRequest, reply: FastifyReply) => {
  const config = request.getDecorator<Configuration>("config");

  const { message, nodeId, signature } = signedMessageSchema.parse(request.body);
  const node = config.trustedPeers.find((peer) => peer.nodeId === nodeId);
  if (!node) {
    return reply.status(401).send({ error: "Unrecognized node ID" });
  }

  const isSignedByNode = verify(
    "ed25519",
    Buffer.from(JSON.stringify(message)),
    { key: node.publicKey },
    Buffer.from(signature, "hex"),
  );
  if (!isSignedByNode) {
    return reply.status(401).send({ error: "Invalid signature" });
  }
};
