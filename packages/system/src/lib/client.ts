import { promisify } from "node:util";
import * as grpc from "@grpc/grpc-js";
import {
  type AbortTransferRequest,
  type AbortTransferResponse,
  type CommitRequest,
  type CommitResponse,
  type DiscoveryRequest,
  type DiscoveryResponse,
  FederationServiceClient,
  type GetTransferStatusRequest,
  type GetTransferStatusResponse,
  type HealthRequest,
  type HealthResponse,
  type InitTransferRequest,
  type InitTransferResponse,
  type ListPeersRequest,
  type ListPeersResponse,
  type SnapshotRequest,
  type SnapshotResponse,
} from "../generated/federation/index.js";

export type {
  AbortTransferRequest,
  AbortTransferResponse,
  CommitRequest,
  CommitResponse,
  DiscoveryRequest,
  DiscoveryResponse,
  GetTransferStatusRequest,
  GetTransferStatusResponse,
  HealthRequest,
  HealthResponse,
  InitTransferRequest,
  InitTransferResponse,
  ListPeersRequest,
  ListPeersResponse,
  SnapshotRequest,
  SnapshotResponse,
};

export type FederationClient = {
  healthAsync: (request: HealthRequest) => Promise<HealthResponse>;
  listPeersAsync: (request: ListPeersRequest) => Promise<ListPeersResponse>;
  discoveryAsync: (request: DiscoveryRequest) => Promise<DiscoveryResponse>;
  initTransferAsync: (request: InitTransferRequest) => Promise<InitTransferResponse>;
  snapshotAsync: (request: SnapshotRequest) => Promise<SnapshotResponse>;
  commitAsync: (request: CommitRequest) => Promise<CommitResponse>;
  getTransferStatusAsync: (request: GetTransferStatusRequest) => Promise<GetTransferStatusResponse>;
  abortTransferAsync: (request: AbortTransferRequest) => Promise<AbortTransferResponse>;
  close: () => void;
};

export function createFederationClient(address: string): FederationClient {
  const client = new FederationServiceClient(address, grpc.credentials.createInsecure());

  return {
    healthAsync: promisify(client.health.bind(client)),
    listPeersAsync: promisify(client.listPeers.bind(client)),
    discoveryAsync: promisify(client.discovery.bind(client)),
    initTransferAsync: promisify(client.initTransfer.bind(client)),
    snapshotAsync: promisify(client.snapshot.bind(client)),
    commitAsync: promisify(client.commit.bind(client)),
    getTransferStatusAsync: promisify(client.getTransferStatus.bind(client)),
    abortTransferAsync: promisify(client.abortTransfer.bind(client)),
    close: () => client.close(),
  };
}
