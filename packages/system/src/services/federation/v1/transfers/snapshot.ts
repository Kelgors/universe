import type { handleUnaryCall } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import type {
  SnapshotRequest,
  SnapshotResponse,
} from "../../../../generated/federation/universe/federation/v1/transfer.js";

export const snapshot: handleUnaryCall<SnapshotRequest, SnapshotResponse> = (_call, callback) => {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: "Not implemented",
  });
};
