import type { FastifyReply, FastifyRequest } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  type ZodFastifySchemaValidationError,
} from "fastify-type-provider-zod";
import { omit } from "lodash-es";
import { type ZodType, z } from "zod";
import type { $ZodError } from "zod/v4/core";
import { createSignedMessage } from "../crypto.js";
import { PayloadError } from "../generated/universe/federation/v1/base.js";

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

export function mergeResponseValidationSchema(...schemas: { [key: number]: ZodType }[]) {
  const mergedSchema: Map<number, ZodType[]> = new Map();
  for (const validationMap of schemas) {
    for (const statusCodeTxt in validationMap) {
      const statusCode = Number(statusCodeTxt);
      if (Number.isNaN(statusCode)) {
        throw new Error(`Invalid status code: ${statusCodeTxt}`);
      }

      const schema = validationMap[statusCodeTxt];
      if (!mergedSchema.has(statusCode)) {
        mergedSchema.set(statusCode, []);
      }

      const existingSchemas = mergedSchema.get(statusCode);
      if (!existingSchemas) throw new Error("Unexpected error: existingSchemas should be defined");
      if (!existingSchemas.some((s) => s === schema)) {
        existingSchemas.push(schema);
      }
    }
  }
  return Object.fromEntries(
    Array.from(mergedSchema.entries()).map(([statusCode, schemas]) => {
      if (schemas.length === 1) {
        return [statusCode, schemas[0]];
      }
      return [statusCode, z.union(schemas)];
    }),
  );
}

export function errorHandler(error: unknown, req: FastifyRequest, reply: FastifyReply) {
  console.dir(error, { depth: null });
  req.log.error({ error, req: { method: req.method, url: req.url } }, "Unexpected error");
  reply
    .code(500)
    .send(
      createSignedMessage(
        PayloadError.encode({ error: "An unexpected error occurred", timestamp: Date.now() }).finish(),
        req.getDecorator("config"),
      ),
    );
}
