import type { handleUnaryCall } from "@grpc/grpc-js";
import { appStageSchema, env, startedAt } from "../../../env.js";
import type { HealthRequest, HealthResponse } from "../../../generated/federation/index.js";

export const health: handleUnaryCall<HealthRequest, HealthResponse> = (_call, callback) => {
  callback(null, {
    status: "ok",
    uptime: Math.floor((Date.now() - startedAt.getTime()) / 1000),
    version: 1,
    stage: appStageSchema.parse(env.APP_STAGE),
  });
};
