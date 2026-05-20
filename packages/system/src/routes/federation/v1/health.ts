import z from "zod";
import { appStageSchema, env, startedAt } from "../../../env.js";
import type { FastifyZodInstance } from "../../../types.js";

export default (fastify: FastifyZodInstance) => {
  fastify.route({
    method: "GET",
    url: "/federation/v1/health",
    schema: {
      response: {
        200: z.object({
          status: z.literal("ok"),
          uptime: z.number().gte(0),
          version: z.number().positive(),
          stage: appStageSchema,
        }),
      },
    },
    handler: () => {
      return {
        status: "ok" as const,
        uptime: Math.floor((Date.now() - startedAt.getTime()) / 1000),
        version: 1,
        stage: env.APP_STAGE,
      };
    },
  });
};
