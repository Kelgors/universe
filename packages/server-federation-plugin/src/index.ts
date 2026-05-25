import type { Configuration } from "@universe/server-shared";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { errorHandler } from "./errors/handler.js";
import { prisma } from "./prisma.js";
import routes from "./routes/federation/v1/index.js";

type PluginOptions = {
  config: Configuration;
};
export default async function federationPlugin(server: FastifyInstance, options: PluginOptions) {
  const { config } = options;
  await prisma.$connect();
  server.log.info("System public key: %s", config.publicKey.export({ format: "pem", type: "spki" }).toString());

  server.addContentTypeParser(
    "application/octet-stream",
    { parseAs: "buffer" },
    async (_req: FastifyRequest, body: Buffer) => Uint8Array.from(body),
  );

  server.decorateRequest("config", null);
  server.decorateRequest("enveloppe", null);
  server.addHook("onRequest", async (req) => {
    req.setDecorator("config", config);
  });

  server.setErrorHandler(errorHandler);

  for (const route of routes) route(server);

  server.addHook("onClose", async () => {
    server.log.info("Shutting down federation...");
    await prisma.$disconnect();
  });

  return server;
}
