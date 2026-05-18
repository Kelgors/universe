import type { handleUnaryCall } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import type {
  CommitRequest,
  CommitResponse,
} from "../../../../generated/federation/universe/federation/v1/transfer.js";

export const commit: handleUnaryCall<CommitRequest, CommitResponse> = (_call, callback) => {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: "Not implemented",
  });
};
