import { loadConfig } from "@universe/server-shared";
import { program } from "commander";
import fastify from "fastify";

type StartOptions = {
  config?: string;
};
export async function start(options: StartOptions) {
  const config = await loadConfig(options.config ?? "configuration.json");
  const server = fastify({
    logger: true,
  });

  await server.register(import("@universe/server-federation-plugin"), { config });

  async function exit() {
    await server.close();
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
