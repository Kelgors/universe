import type { handleUnaryCall } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import type { DiscoveryRequest, DiscoveryResponse } from "../../../generated/federation/index.js";

export const discovery: handleUnaryCall<DiscoveryRequest, DiscoveryResponse> = (_call, callback) => {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: "Not implemented",
  });
};
