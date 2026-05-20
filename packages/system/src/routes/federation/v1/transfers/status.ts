import type { FastifyZodInstance } from "../../../../types.js";

export default (fastify: FastifyZodInstance) => {
  fastify.route({
    method: "GET",
    url: "/federation/v1/transfers/status",
    handler: async (_request, reply) => {
      return reply.status(500).send({ error: "Not implemented" });
    },
  });
};
