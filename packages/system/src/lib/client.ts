import { promisify } from "node:util";
import * as grpc from "@grpc/grpc-js";
import {
  type DiscoveryRequest,
  type DiscoveryResponse,
  FederationServiceClient,
  type HealthRequest,
  type HealthResponse,
  type ListPeersRequest,
  type ListPeersResponse,
} from "../generated/federation/universe/federation/v1/federation.js";

export type {
  AbortTransferRequest,
  AbortTransferResponse,
  CommitRequest,
  CommitResponse,
  GetTransferStatusRequest,
  GetTransferStatusResponse,
  InitTransferRequest,
  InitTransferResponse,
  SnapshotRequest,
  SnapshotResponse,
} from "../generated/federation/universe/federation/v1/transfer.js";

export type FederationClient = {
  healthAsync: (request: HealthRequest) => Promise<HealthResponse>;
  listPeersAsync: (request: ListPeersRequest) => Promise<ListPeersResponse>;
  discoveryAsync: (request: DiscoveryRequest) => Promise<DiscoveryResponse>;
  close: () => void;
};

export function createFederationClient(address: string): FederationClient {
  const client = new FederationServiceClient(address, grpc.credentials.createInsecure());

  return {
    healthAsync: promisify(client.health.bind(client)),
    listPeersAsync: promisify(client.listPeers.bind(client)),
    discoveryAsync: promisify(client.discovery.bind(client)),
    close: () => client.close(),
  };
}
