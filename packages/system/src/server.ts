import fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import routes from "./routes/federation/v1/index.js";

export function createServer() {
  const server = fastify({
    logger: true,
  });
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  for (const route of routes) {
    server.withTypeProvider<ZodTypeProvider>().route(route);
  }

  return server;
}
