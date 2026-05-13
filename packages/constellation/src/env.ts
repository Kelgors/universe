import z from "zod";
import "dotenv/config";

export const env = z
  .object({
    APP_STAGE: z.enum(["dev", "prod", "test"]),
    PRIVATE_KEY: z.string()
  })
  .parse(process.env);
