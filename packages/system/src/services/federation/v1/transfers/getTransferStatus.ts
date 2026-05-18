import type { handleUnaryCall } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import type { GetTransferStatusRequest, GetTransferStatusResponse } from "../../../../generated/federation/index.js";

export const getTransferStatus: handleUnaryCall<GetTransferStatusRequest, GetTransferStatusResponse> = (
  _call,
  callback,
) => {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: "Not implemented",
  });
};
