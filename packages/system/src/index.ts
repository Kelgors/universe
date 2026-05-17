import { createServer } from "./server.js";

export function start() {
  const server = createServer();

  server.listen({ port: 3000 }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info(`Server listening at ${address}`);
  });
}

start();
