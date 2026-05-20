import fastify from "fastify";
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { Configuration } from "./configuration.js";
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

  server.setErrorHandler((err, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(err)) {
      return reply.code(400).send({
        error: "Response Validation Error",
        message: "Request doesn't match the schema",
        statusCode: 400,
        details: {
          issues: err.validation,
          method: req.method,
          url: req.url,
        },
      });
    }
  });

  for (const route of routes) route(server);

  return server;
}
