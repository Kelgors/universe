import type { Configuration } from "@universe/server-shared";
import type { FastifyInstance } from "fastify";

export default (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/federation/v1/peers",
    handler: (request) => {
      const config = request.getDecorator<Configuration>("config");
      return {
        peers: config.trustedPeers.map((peer) => ({
          nodeId: peer.nodeId,
          host: peer.host,
          publicKey: peer.publicKey.export({ format: "pem", type: "spki" }).toString(),
          status: "unknown",
        })),
      };
    },
  });
};
