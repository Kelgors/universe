import z from "zod";

export const zodErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  details: z.object({
    method: z.string(),
    url: z.string(),
    issues: z.array(
      z.object({
        keyword: z.string(),
        instancePath: z.string(),
        schemaPath: z.string(),
        message: z.string(),
        params: z.record(z.string(), z.unknown()),
      }),
    ),
  }),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export const defaultServerValidation = {
  400: zodErrorResponseSchema,
  500: errorResponseSchema,
};
