import { loadConfig } from "@universe/server-shared";
import { program } from "commander";
import { createServer } from "./server.js";

type StartOptions = {
  config?: string;
};
export async function start(options: StartOptions) {
  const config = await loadConfig(options.config ?? "configuration.json");
  const server = await createServer(config);

  async function onExitSignal(signal: NodeJS.Signals | "exit") {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    process.off("SIGINT", onExitSignal);
    process.off("SIGTERM", onExitSignal);
    await server.close();
  }
  process.once("SIGINT", onExitSignal);
  process.once("SIGTERM", onExitSignal);

  server.listen({ port: 3001 }, (err, address) => {
    if (err) {
      server.log.error(err);
      void server.close().finally(() => process.exit(1));
      return;
    }
    server.log.info(`Server listening at ${address}`);
  });
}

program
  .name("federation")
  .description("Serve the federation API")
  .option("--config <path>", "Path to the configuration file", "configuration.json")
  .action(start)
  .parse(process.argv);
