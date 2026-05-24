import type { FastifyInstance } from "fastify";
import { env, startedAt } from "../../../env.js";

export default (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/federation/v1/health",
    handler: () => {
      return {
        status: "ok",
        uptime: Math.floor((Date.now() - startedAt.getTime()) / 1000),
        version: 1,
        stage: env.APP_STAGE,
      };
    },
  });
};
