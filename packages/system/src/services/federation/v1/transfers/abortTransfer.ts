import type { handleUnaryCall } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import type {
  AbortTransferRequest,
  AbortTransferResponse,
} from "../../../../generated/federation/universe/federation/v1/transfer.js";

export const abortTransfer: handleUnaryCall<AbortTransferRequest, AbortTransferResponse> = (_call, callback) => {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: "Not implemented",
  });
};
