import { generateKeyPair } from "node:crypto";
import { promisify } from "node:util";
import type { Configuration } from "../src/configuration.js";
import { FederationPlayerTransferState } from "../src/generated/prisma/enums.js";

export const NODE1_IDENTITY = await promisify(generateKeyPair)("ed25519");
export const NODE2_IDENTITY = await promisify(generateKeyPair)("ed25519");

export function mockConfig(override?: Partial<Configuration>): Configuration {
  return {
    nodeId: "00000000-0000-4000-8000-000000000000",
    privateKey: NODE1_IDENTITY.privateKey,
    publicKey: NODE1_IDENTITY.publicKey,
    trustedPeers: [
      {
        nodeId: "00000000-0000-4000-8000-000000000001",
        comment: "System Dublin Delta",
        host: { ip: "127.0.0.1", port: 8000 },
        publicKey: NODE2_IDENTITY.publicKey,
      },
    ],
    ...override,
  };
}

export function mockFederationTransfer() {
  return {
    requestId: "00000000-0000-4000-8000-000000000000",
    sourceSystemId: "00000000-0000-4000-8000-000000000001",
    targetSystemId: "00000000-0000-4000-8000-000000000000",
    playerId: "00000000-0000-4000-8000-000000000000",
    state: FederationPlayerTransferState.APPROVED_BY_TARGET,
  };
}
