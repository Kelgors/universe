import type { FastifyReply } from "fastify";

export function onlySourceSystemCanInitiateTransfer(reply: FastifyReply) {
  return reply.status(400).send({ error: "Only source system can initiate transfer" });
}

export function onlyTargetSystemCanAcceptTransfer(reply: FastifyReply) {
  return reply.status(400).send({ error: "Only target system can accept transfer" });
}

export function transferNotApprovedByTarget(reply: FastifyReply) {
  return reply.status(400).send({ error: "Transfer is not approved by target" });
}

export function transferRequestIdAlreadyExists(reply: FastifyReply) {
  return reply.status(409).send({ error: "Transfer with the same requestId already exists" });
}

export function transferNotFound(reply: FastifyReply) {
  return reply.status(404).send({ error: "Transfer not found" });
}

export function snapshotHashNotMatch(reply: FastifyReply) {
  return reply.status(400).send({ error: "Snapshot hash does not match" });
}

export function snapshotParseError(reply: FastifyReply) {
  return reply.status(400).send({ error: "Snapshot parse error" });
}
