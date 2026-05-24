import type { FastifyRequest } from "fastify";
import type { SignedEnveloppe } from "../generated/universe/federation/v1/base.js";
import { prisma } from "../prisma.js";

export function saveFederationEvent(eventType: string) {
  return async (request: FastifyRequest) => {
    const enveloppe = request.getDecorator<SignedEnveloppe | undefined>("enveloppe");
    if (!enveloppe) return;

    const { nodeId, message, signature } = enveloppe;

    await prisma.federationEvent.create({
      data: {
        eventType,
        nodeId,
        message: Uint8Array.from(message),
        signature: Uint8Array.from(signature),
      },
    });
  };
}
