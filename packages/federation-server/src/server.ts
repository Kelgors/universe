import type { Configuration } from "@universe/server-shared";
import { type FastifyRequest, fastify } from "fastify";
import { errorHandler } from "./errors/handler.js";
import { prisma } from "./prisma.js";
import routes from "./routes/federation/v1/index.js";

export async function createServer(options: { config: Configuration }) {
  const { config } = options;
  await prisma.$connect();

  const server = fastify({
    logger: true,
  });
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
