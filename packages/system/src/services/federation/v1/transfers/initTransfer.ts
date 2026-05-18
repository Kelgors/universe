import type { handleUnaryCall } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import type {
  InitTransferRequest,
  InitTransferResponse,
} from "../../../../generated/federation/universe/federation/v1/transfer.js";

export const initTransfer: handleUnaryCall<InitTransferRequest, InitTransferResponse> = (_call, callback) => {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: "Not implemented",
  });
};
