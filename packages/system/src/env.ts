import z from "zod";
import "dotenv/config";

export const appStageSchema = z.enum(["dev", "prod", "test"]);

export const env = z
  .object({
    APP_STAGE: appStageSchema,
    DATABASE_URL: z.url(),
  })
  .parse(process.env);

export const startedAt = new Date();
