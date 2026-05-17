import z from "zod";
import "dotenv/config";

export const env = z
  .object({
    APP_STAGE: z.enum(["dev", "prod", "test"]),
  })
  .parse(process.env);

export const startedAt = new Date();
