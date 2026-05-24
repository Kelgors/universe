import type { FastifyReply } from "fastify";
import z, { ZodError } from "zod";
import { createSignedMessage } from "../crypto.js";
import { PayloadError } from "../generated/universe/federation/v1/base.js";

export function validationError(reply: FastifyReply, error: unknown, message = "Invalid payload format") {
  return reply.status(400).send(
    createSignedMessage(
      PayloadError.encode({
        error: message,
        details:
          error instanceof ZodError ? z.prettifyError(error) : error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      }).finish(),
      reply.request.getDecorator("config"),
    ),
  );
}

export function outdatedMessageError(reply: FastifyReply, messageTimestamp: number) {
  return reply.status(400).send(
    createSignedMessage(
      PayloadError.encode({
        error: "Message out of acceptable time range",
        details: `payload.timestamp is ${messageTimestamp} and current time is ${Date.now()}`,
        timestamp: Date.now(),
      }).finish(),
      reply.request.getDecorator("config"),
    ),
  );
}

export function onlySourceSystemCanInitiateTransfer(reply: FastifyReply) {
  return reply
    .status(400)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "Only source system can initiate transfer", timestamp: Date.now() }).finish(),
        reply.request.getDecorator("config"),
      ),
    );
}

export function onlyTargetSystemCanAcceptTransfer(reply: FastifyReply) {
  return reply
    .status(400)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "Only target system can accept transfer", timestamp: Date.now() }).finish(),
        reply.request.getDecorator("config"),
      ),
    );
}

export function transferNotApprovedByTarget(reply: FastifyReply) {
  return reply
    .status(400)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "Transfer is not approved by target", timestamp: Date.now() }).finish(),
        reply.request.getDecorator("config"),
      ),
    );
}

export function transferRequestIdAlreadyExists(reply: FastifyReply) {
  return reply.status(409).send(
    createSignedMessage(
      PayloadError.encode({
        error: "Transfer with the same requestId already exists",
        timestamp: Date.now(),
      }).finish(),
      reply.request.getDecorator("config"),
    ),
  );
}

export function transferNotFound(reply: FastifyReply) {
  return reply
    .status(404)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "Transfer not found", timestamp: Date.now() }).finish(),
        reply.request.getDecorator("config"),
      ),
    );
}

export function snapshotHashNotMatch(reply: FastifyReply) {
  return reply
    .status(400)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "Snapshot hash does not match", timestamp: Date.now() }).finish(),
        reply.request.getDecorator("config"),
      ),
    );
}

export function snapshotParseError(reply: FastifyReply) {
  return reply
    .status(400)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "Snapshot parse error", timestamp: Date.now() }).finish(),
        reply.request.getDecorator("config"),
      ),
    );
}

export function notImplemented(reply: FastifyReply) {
  return reply
    .status(501)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "Not implemented", timestamp: Date.now() }).finish(),
        reply.request.getDecorator("config"),
      ),
    );
}
