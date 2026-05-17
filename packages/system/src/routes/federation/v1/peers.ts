import type { RouteOptions } from "fastify";

const route: RouteOptions = {
  method: "GET",
  url: "/federation/v1/peers",
  handler: async (_request, _reply) => {
    return {
      peers: [],
    };
  },
};

export default route;
