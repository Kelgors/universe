import { prisma } from "./prisma.js";
import { createServer } from "./server.js";
import "./configuration.js";
import { program } from "commander";
import { loadConfig } from "./configuration.js";

type StartOptions = {
  config?: string;
};
export async function start(options: StartOptions) {
  await prisma.$connect();
  const config = await loadConfig(options.config ?? "configuration.json");
  const server = await createServer(config);

  async function exit() {
    await server.close();
    await prisma.$disconnect();
  }

  async function onExitSignal(signal: NodeJS.Signals | "exit") {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    process.off("SIGINT", onExitSignal);
    process.off("SIGTERM", onExitSignal);
    await exit();
  }
  process.once("SIGINT", onExitSignal);
  process.once("SIGTERM", onExitSignal);

  server.listen({ port: 3000 }, (err, address) => {
    if (err) {
      server.log.error(err);
      void exit().finally(() => process.exit(1));
      return;
    }
    server.log.info(`Server listening at ${address}`);
  });
}

program
  .name("system")
  .description("Serve a system node")
  .option("--config <path>", "Path to the configuration file", "configuration.json")
  .action(start)
  .parse(process.argv);
