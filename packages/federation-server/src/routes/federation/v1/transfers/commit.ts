import type { FastifyInstance } from "fastify";
import { notImplemented } from "../../../../errors/replies.js";

export default (fastify: FastifyInstance) => {
  fastify.route({
    method: "POST",
    url: "/federation/v1/transfers/commit",
    handler: async (_request, reply) => {
      return notImplemented(reply);
    },
  });
};
