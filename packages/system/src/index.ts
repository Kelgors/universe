import { prisma } from "./prisma.js";
import { createServer } from "./server.js";

export async function start() {
  await prisma.$connect();
  const server = createServer();

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

void start();
