import type { FastifyReply, FastifyRequest } from "fastify";
import { createSignedEnveloppe } from "../crypto.js";
import { FederationError } from "../generated/universe/federation/v1/base.js";

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
