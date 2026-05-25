import { FederationError } from "@universe/game-protocol/federation";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createSignedEnveloppe } from "../crypto.js";

export function errorHandler(error: unknown, req: FastifyRequest, reply: FastifyReply) {
  req.log.error({ error, req: { method: req.method, url: req.url } }, "Unexpected error");
  reply
    .code(500)
    .send(
      createSignedEnveloppe(
        FederationError.encode({ code: "An unexpected error occurred", timestamp: Date.now() }).finish(),
        req.getDecorator("config"),
      ),
    );
}
