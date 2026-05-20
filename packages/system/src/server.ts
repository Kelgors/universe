import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { Configuration } from "./configuration.js";
import { errorHandler } from "./errorHandler.js";
import routes from "./routes/federation/v1/index.js";

export function createServer(config: Configuration) {
  const server = fastify({
    logger: true,
  });
  server.log.info("System public key: %s", config.publicKey.export({ format: "pem", type: "spki" }).toString());

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);
  server.decorateRequest("config", null);
  server.addHook("onRequest", async (req) => {
    req.setDecorator("config", config);
  });

  server.setErrorHandler(errorHandler);

  for (const route of routes) route(server);

  return server;
}
