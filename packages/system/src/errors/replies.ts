import type { FastifyReply } from "fastify";

export function onlySourceSystemCanInitiateTransfer(reply: FastifyReply) {
  return reply.status(400).send({ error: "Only source system can initiate transfer" });
}

export function onlyTargetSystemCanAcceptTransfer(reply: FastifyReply) {
  return reply.status(400).send({ error: "Only target system can accept transfer" });
}

export function transferRequestIdAlreadyExists(reply: FastifyReply) {
  return reply.status(409).send({ error: "Transfer with the same requestId already exists" });
}
