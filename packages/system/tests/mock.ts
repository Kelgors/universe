import { generateKeyPair } from "node:crypto";
import { promisify } from "node:util";
import type { FastifyInstance } from "fastify";
import type { Configuration } from "../src/configuration.js";
import { FederationPlayerTransferState } from "../src/generated/prisma/enums.js";
import type { FederationPlayerTransferCreateInput } from "../src/generated/prisma/models.js";

export const NODE1_IDENTITY = await promisify(generateKeyPair)("ed25519");
export const NODE2_IDENTITY = await promisify(generateKeyPair)("ed25519");

export function mockFastify(): FastifyInstance {
  return {
    route: vi.fn(),
  } as never;
}

export function mockNode1Config(override?: Partial<Configuration>): Configuration {
  return {
    nodeId: "00000000-0000-4000-8000-000000000001",
    privateKey: NODE1_IDENTITY.privateKey,
    publicKey: NODE1_IDENTITY.publicKey,
    trustedPeers: [
      {
        nodeId: "00000000-0000-4000-8000-000000000002",
        comment: "System Dublin Delta",
        host: { ip: "127.0.0.1", port: 8002 },
        publicKey: NODE2_IDENTITY.publicKey,
      },
    ],
    ...override,
  };
}

export function mockNode2Config(override?: Partial<Configuration>): Configuration {
  return {
    nodeId: "00000000-0000-4000-8000-000000000002",
    privateKey: NODE2_IDENTITY.privateKey,
    publicKey: NODE2_IDENTITY.publicKey,
    trustedPeers: [
      {
        nodeId: "00000000-0000-4000-8000-000000000001",
        comment: "System Dublin Alpha",
        host: { ip: "127.0.0.1", port: 8001 },
        publicKey: NODE1_IDENTITY.publicKey,
      },
    ],
    ...override,
  };
}

export function mockFederationTransfer(override?: Partial<FederationPlayerTransferCreateInput>) {
  return {
    requestId: "00000000-0000-4000-8000-000000000000",
    sourceSystemId: "00000000-0000-4000-8000-000000000002",
    targetSystemId: "00000000-0000-4000-8000-000000000001",
    playerId: "00000000-0000-4000-8000-000000000000",
    state: FederationPlayerTransferState.APPROVED_BY_TARGET,
    ...override,
  };
}
