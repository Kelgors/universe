import type { Configuration } from "@universe/server-shared";
import { fastify } from "fastify";
import { prisma } from "./prisma.js";

export async function createServer(options: { config: Configuration }) {
  const { config } = options;
  await prisma.$connect();

  const server = fastify({
    logger: true,
  });
  server.log.info("System public key: %s", config.publicKey.export({ format: "pem", type: "spki" }).toString());

  await server.register(import("@fastify/websocket"));

  server.get("/", { websocket: true }, (socket, _req) => {
    socket.on("message", (_message: unknown) => {
      socket.send("hi from server");
    });
  });

  server.addHook("onClose", async () => {
    server.log.info("Shutting down game server...");
    await prisma.$disconnect();
  });

  return server;
}
