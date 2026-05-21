import type { FastifyRequest } from "fastify";
import type z from "zod";
import type { identifiedSignedMessageSchema } from "../crypto.js";
import { prisma } from "../prisma.js";

type FastifyRequestWithFederationEvent = FastifyRequest & {
  body: z.infer<typeof identifiedSignedMessageSchema>;
};

export function saveFederationEvent(eventType: string) {
  return async (request: FastifyRequestWithFederationEvent) => {
    const { message, nodeId, signature } = request.body;

    await prisma.federationEvent.create({
      data: {
        eventType,
        nodeId,
        payload: JSON.stringify(message),
        signature,
      },
    });
  };
}
