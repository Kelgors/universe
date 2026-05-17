import z from "zod";
import { startedAt } from "../../../env.js";
import type { AppRouteOptions } from "../../../types.js";

const route: AppRouteOptions = {
  method: "GET",
  url: "/federation/v1/health",
  schema: {
    response: {
      200: z.object({
        status: z.literal("ok"),
        uptime: z.number().gte(0),
        version: z.number().positive(),
      }),
    },
  },
  handler: async () => {
    return {
      status: "ok",
      uptime: Math.floor((Date.now() - startedAt.getTime()) / 1000),
      version: 1,
    };
  },
};

export default route;
