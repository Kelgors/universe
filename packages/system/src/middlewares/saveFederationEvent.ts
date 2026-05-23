import type { FastifyRequest } from "fastify";
import type { SignedMessage } from "../crypto.js";
import { prisma } from "../prisma.js";

type FastifyRequestWithFederationEvent = FastifyRequest & {
  body: SignedMessage;
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
