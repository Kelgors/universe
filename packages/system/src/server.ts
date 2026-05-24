import fastify, { type FastifyRequest } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { Configuration } from "./configuration.js";
import { errorHandler } from "./errors/handler.js";
import routes from "./routes/federation/v1/index.js";

export async function createServer(config: Configuration) {
  const server = fastify({
    logger: true,
  });
  server.log.info("System public key: %s", config.publicKey.export({ format: "pem", type: "spki" }).toString());

  server.addContentTypeParser(
    "application/octet-stream",
    { parseAs: "buffer" },
    async (_req: FastifyRequest, body: Buffer) => body,
  );

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);
  server.decorateRequest("config", null);
  server.decorateReply("config", null);
  server.decorateRequest("message", null);
  server.addHook("onRequest", async (req) => {
    req.setDecorator("config", config);
  });

  server.setErrorHandler(errorHandler);

  for (const route of routes) route(server);

  return server;
}
