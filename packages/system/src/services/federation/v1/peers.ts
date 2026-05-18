import type { handleUnaryCall } from "@grpc/grpc-js";
import type { Configuration } from "../../../configuration.js";
import type {
  ListPeersRequest,
  ListPeersResponse,
} from "../../../generated/federation/universe/federation/v1/federation.js";

export function createListPeersHandler(config: Configuration): handleUnaryCall<ListPeersRequest, ListPeersResponse> {
  return (_call, callback) => {
    callback(null, {
      peers: config.trustedPeers.map((peer) => ({
        id: peer.id,
        host: peer.host,
        publicKey: Buffer.from(peer.publicKey).toString("hex"),
        status: "unknown",
      })),
    });
  };
}
