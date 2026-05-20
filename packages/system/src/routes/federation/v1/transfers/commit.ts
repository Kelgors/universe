import type { FastifyZodInstance } from "../../../../types.js";

export default (fastify: FastifyZodInstance) => {
  fastify.route({
    method: "POST",
    url: "/federation/v1/transfers/commit",
    handler: async (_request, reply) => {
      return reply.status(500).send({ error: "Not implemented" });
    },
  });
};
