import * as grpc from "@grpc/grpc-js";
import type { Configuration } from "./configuration.js";
import { FederationServiceService } from "./generated/federation/universe/federation/v1/federation.js";
import { createFederationHandlers } from "./services/federation/v1/index.js";

export type GrpcServerHandle = {
  server: grpc.Server;
  port: number;
  shutdown: () => Promise<void>;
};

function bindServer(server: grpc.Server, host: string, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), (error, boundPort) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(boundPort);
    });
  });
}

export async function createServer(
  config: Configuration,
  options?: { host?: string; port?: number },
): Promise<GrpcServerHandle> {
  const host = options?.host ?? "0.0.0.0";
  const port = options?.port ?? 3000;

  const server = new grpc.Server();
  server.addService(FederationServiceService, createFederationHandlers(config));

  const boundPort = await bindServer(server, host, port);

  return {
    server,
    port: boundPort,
    shutdown: () =>
      new Promise((resolve, reject) => {
        server.tryShutdown((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}
