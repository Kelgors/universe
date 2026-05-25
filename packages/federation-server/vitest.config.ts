import { config } from "dotenv";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    dir: process.cwd(),
    exclude: ["**/*.snap"],
    env: config({ path: "./tests/.test.env" }).parsed,
    coverage: {
      provider: "v8",
      exclude: [
        "tests",
        "dist",
        "node_modules",
        "vitest.config.ts",
        "env.ts",
        "src/index.ts",
        "mock.ts",
        "setup.ts",
        "setupTf.ts",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          setupFiles: ["./tests/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "func",
          include: ["tests/func/**/*.test.ts"],
          setupFiles: ["./tests/setup.ts", "./tests/setupTf.ts"],
          fileParallelism: false,
        },
      },
    ],
  },
});
