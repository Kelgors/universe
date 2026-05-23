import type { FastifyReply, FastifyRequest } from "fastify";
import type { SignedMessage } from "../crypto.js";
import { ACCEPTABLE_TIME_RANGE } from "../env.js";

type FastifyRequestWithTimestampedMessage = FastifyRequest & {
  body: SignedMessage<{ timestamp: Date }>;
};

export const checkMessageTimestamp = async (request: FastifyRequestWithTimestampedMessage, reply: FastifyReply) => {
  const { message } = request.body;

  if (Math.abs(Date.now() - message.timestamp.getTime()) > ACCEPTABLE_TIME_RANGE) {
    return reply.status(400).send({ error: "Message out of acceptable time range" });
  }
};
