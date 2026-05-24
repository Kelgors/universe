import type { FastifyReply, FastifyRequest } from "fastify";
import { createSignedMessage } from "../crypto.js";
import { PayloadError } from "../generated/universe/federation/v1/base.js";

export function errorHandler(error: unknown, req: FastifyRequest, reply: FastifyReply) {
  req.log.error({ error, req: { method: req.method, url: req.url } }, "Unexpected error");
  reply
    .code(500)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "An unexpected error occurred", timestamp: Date.now() }).finish(),
        req.getDecorator("config"),
      ),
    );
}
