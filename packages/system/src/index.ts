import { program } from "commander";
import { loadConfig } from "./configuration.js";
import { prisma } from "./prisma.js";
import { createServer } from "./server.js";

type StartOptions = {
  config?: string;
};

export async function start(options: StartOptions) {
  await prisma.$connect();
  const config = await loadConfig(options.config ?? "configuration.json");
  const { port, shutdown } = await createServer(config);

  async function exit() {
    await shutdown();
    await prisma.$disconnect();
  }

  async function onExitSignal(signal: NodeJS.Signals | "exit") {
    console.info(`Received ${signal}, shutting down gracefully...`);
    process.off("SIGINT", onExitSignal);
    process.off("SIGTERM", onExitSignal);
    await exit();
  }
  process.once("SIGINT", onExitSignal);
  process.once("SIGTERM", onExitSignal);

  console.info(`gRPC server listening on port ${port}`);
}

program
  .name("system")
  .description("Serve a system node")
  .option("--config <path>", "Path to the configuration file", "configuration.json")
  .action(start)
  .parse(process.argv);
