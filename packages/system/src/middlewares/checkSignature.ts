import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import type { Configuration } from "../configuration.js";
import { identifiedSignedMessageSchema, isSignatureOk } from "../crypto.js";
import { createFastifyValidationError, createValidationError } from "../errorHandler.js";

export const checkSignatureResponses = {
  401: z.object({
    error: z.string(),
  }),
};

export const checkSignature = async (request: FastifyRequest, reply: FastifyReply) => {
  const config = request.getDecorator<Configuration>("config");

  const result = identifiedSignedMessageSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send(createValidationError(request, createFastifyValidationError(result.error)));
  }

  const { message, nodeId, signature } = result.data;
  const node = config.trustedPeers.find((peer) => peer.nodeId === nodeId);
  if (!node) {
    return reply.status(401).send({ error: "Unrecognized node ID" });
  }

  if (!isSignatureOk(message, signature, node.publicKey)) {
    return reply.status(401).send({ error: "Invalid signature" });
  }
};
