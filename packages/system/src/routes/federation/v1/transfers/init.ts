import type { RouteOptions } from "fastify";

const route: RouteOptions = {
  method: "POST",
  url: "/federation/v1/transfers/init",
  handler: async (_request, reply) => {
    return reply.status(500).send({ error: "Not implemented" });
  },
};

export default route;
