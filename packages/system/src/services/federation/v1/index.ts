import type { Configuration } from "../../../configuration.js";
import type { FederationServiceServer } from "../../../generated/federation/universe/federation/v1/federation.js";
import { discovery } from "./discovery.js";
import { health } from "./health.js";
import { createListPeersHandler } from "./peers.js";
import { abortTransfer, commit, getTransferStatus, initTransfer, snapshot } from "./transfers/index.js";

export function createFederationHandlers(config: Configuration): FederationServiceServer {
  return {
    health,
    listPeers: createListPeersHandler(config),
    discovery,
    initTransfer,
    snapshot,
    commit,
    getTransferStatus,
    abortTransfer,
  };
}
