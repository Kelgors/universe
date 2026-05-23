import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import type { Configuration } from "../configuration.js";
import { createSignedMessageSchema, isSignatureOk, type SignedMessage } from "../crypto.js";
import { createFastifyValidationError, createValidationError } from "../errors/handler.js";
import { zodErrorResponseSchema } from "../schemas.js";

export const checkSignatureResponses = {
  400: zodErrorResponseSchema,
  401: z.object({
    error: z.string(),
  }),
};

const signedMessageSchema = createSignedMessageSchema(z.unknown());

type FastifyRequestWithSignature = FastifyRequest & {
  body: SignedMessage<unknown>;
};

export const checkSignature = async (request: FastifyRequestWithSignature, reply: FastifyReply) => {
  const config = request.getDecorator<Configuration>("config");

  const result = signedMessageSchema.safeParse(request.body);
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
