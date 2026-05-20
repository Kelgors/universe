import { generateKeyPair } from "node:crypto";
import { promisify } from "node:util";
import type { Configuration } from "../src/configuration.js";

export const NODE1_IDENTITY = await promisify(generateKeyPair)("ed25519");
export const NODE2_IDENTITY = await promisify(generateKeyPair)("ed25519");

export function mockConfig(override?: Partial<Configuration>): Configuration {
  return {
    privateKey: NODE1_IDENTITY.privateKey,
    publicKey: NODE1_IDENTITY.publicKey,
    trustedPeers: [
      {
        nodeId: "833ad174-d44e-45fb-a8b4-e5c77ddf6b6a",
        comment: "System Dublin Delta",
        host: { ip: "127.0.0.1", port: 8000 },
        publicKey: NODE2_IDENTITY.publicKey,
      },
    ],
    ...override,
  };
}
