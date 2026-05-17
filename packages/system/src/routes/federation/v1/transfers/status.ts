import type { RouteOptions } from "fastify";

const route: RouteOptions = {
  method: "GET",
  url: "/federation/v1/transfers/:transferId/status",
  handler: async (_request, reply) => {
    return reply.status(500).send({ error: "Not implemented" });
  },
};

export default route;
