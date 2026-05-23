import z from "zod";
import type { Configuration } from "../../../configuration.js";
import type { FastifyZodInstance } from "../../../types.js";

export default (fastify: FastifyZodInstance) => {
  fastify.route({
    method: "GET",
    url: "/federation/v1/peers",
    schema: {
      response: {
        200: z.object({
          peers: z.array(
            z.object({
              nodeId: z.string(),
              host: z.object({ ip: z.string(), port: z.number() }),
              publicKey: z.string(),
              status: z.enum(["ok", "unreachable", "unknown"]),
            }),
          ),
        }),
      },
    },
    handler: (request) => {
      const config = request.getDecorator<Configuration>("config");
      return {
        peers: config.trustedPeers.map((peer) => ({
          nodeId: peer.nodeId,
          host: peer.host,
          publicKey: peer.publicKey.export({ format: "pem", type: "spki" }).toString(),
          status: "unknown" as const,
        })),
      };
    },
  });
};
