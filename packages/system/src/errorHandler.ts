import type { FastifyReply, FastifyRequest } from "fastify";
import { hasZodFastifySchemaValidationErrors, type ZodFastifySchemaValidationError } from "fastify-type-provider-zod";
import type { $ZodError } from "zod/v4/core";
import { env } from "./env.js";

export function createValidationError(req: FastifyRequest, error: ZodFastifySchemaValidationError) {
  return {
    error: "Response Validation Error",
    message: "Request doesn't match the schema",
    statusCode: 400,
    details: {
      issues: error,
      method: req.method,
      url: req.url,
    },
  };
}

// FROM fastify-type-provider-zod
function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const result = {} as Omit<T, K>;
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (!keys.includes(key as K)) {
      // @ts-expect-error
      result[key] = obj[key];
    }
  }
  return result;
}

const ZodFastifySchemaValidationErrorSymbol: symbol = Symbol.for("ZodFastifySchemaValidationError");
export function createFastifyValidationError(error: $ZodError): ZodFastifySchemaValidationError[] {
  return error.issues.map((issue) => {
    return {
      [ZodFastifySchemaValidationErrorSymbol]: true,
      keyword: issue.code,
      instancePath: `/${issue.path.join("/")}`,
      schemaPath: `#/${issue.path.join("/")}/${issue.code}`,
      message: issue.message,
      params: {
        ...omit(issue, ["path", "code", "message"]),
      },
    };
  });
}
// ENDFROM

export function errorHandler(err: unknown, req: FastifyRequest, reply: FastifyReply) {
  if (hasZodFastifySchemaValidationErrors(err)) {
    console.dir(err);
    return reply.code(400).send(createValidationError(req, err.validation));
  }

  if (env.APP_STAGE !== "prod") {
    console.error("Unexpected error");
    console.dir(err, { depth: null });
  } else {
    console.error("Unexpected error:", err instanceof Error ? err.stack : err);
  }
  reply.code(500).send({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
    statusCode: 500,
  });
}
