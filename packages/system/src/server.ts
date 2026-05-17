import fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { Configuration } from "./configuration.js";
import routes from "./routes/federation/v1/index.js";

export function createServer(config: Configuration) {
  const server = fastify({
    logger: true,
  });
  server.log.info("System public key: %s", Buffer.from(config.publicKey).toString("hex"));

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);
  server.decorateRequest("config", null);
  server.addHook("onRequest", async (req) => {
    req.setDecorator("config", config);
  });

  for (const route of routes) {
    server.withTypeProvider<ZodTypeProvider>().route(route);
  }

  return server;
}
