import { sign } from "node:crypto";
import type { Configuration } from "./configuration.js";
import { SignedMessage } from "./generated/universe/federation/v1/base.js";

export function createSignedMessage(
  payload: Uint8Array,
  { privateKey, nodeId }: Pick<Configuration, "privateKey" | "nodeId">,
): Uint8Array {
  return Buffer.from(
    SignedMessage.encode({
      nodeId,
      payload: Buffer.from(payload),
      signature: sign(null, payload, { key: privateKey }),
    }).finish(),
  );
}
