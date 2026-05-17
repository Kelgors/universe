import type { RouteOptions } from "fastify";
import z from "zod";
import type { Configuration } from "../../../configuration.js";

const route: RouteOptions = {
  method: "GET",
  url: "/federation/v1/peers",
  schema: {
    response: {
      200: z.object({
        peers: z.array(
          z.object({
            id: z.string(),
            host: z.object({ ip: z.string(), port: z.number() }),
            publicKey: z.string(),
            status: z.enum(["ok", "unreachable", "unknown"]),
          }),
        ),
      }),
    },
  },
  handler: async (request, _reply) => {
    const config = request.getDecorator<Configuration>("config");
    return {
      peers: config.trustedPeers.map((peer) => ({
        id: peer.id,
        host: peer.host,
        publicKey: Buffer.from(peer.publicKey).toString("hex"),
        status: "unknown",
      })),
    };
  },
};

export default route;
