import type { FastifyRequest } from "fastify";
import type { SignedMessage } from "../generated/universe/federation/v1/base.js";
import { prisma } from "../prisma.js";

export function saveFederationEvent(eventType: string) {
  return async (request: FastifyRequest) => {
    const message = request.getDecorator<SignedMessage | undefined>("message");
    if (!message) return;

    const { nodeId, payload, signature } = message;

    await prisma.federationEvent.create({
      data: {
        eventType,
        nodeId,
        payload: Uint8Array.from(payload),
        signature: Uint8Array.from(signature),
      },
    });
  };
}
