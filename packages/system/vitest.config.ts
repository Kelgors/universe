import { config } from "dotenv";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "./tests/setup.ts",
    globals: true,
    include: ["./tests/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    env: config({ path: "./tests/.test.env" }).parsed,
  },
});
