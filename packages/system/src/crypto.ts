import { sign } from "node:crypto";
import type { Configuration } from "./configuration.js";
import { SignedEnveloppe } from "./generated/universe/federation/v1/base.js";

export function createSignedEnveloppe(
  payload: Uint8Array,
  { privateKey, nodeId }: Pick<Configuration, "privateKey" | "nodeId">,
): Uint8Array {
  return Buffer.from(
    SignedEnveloppe.encode({
      nodeId,
      message: Buffer.from(payload),
      signature: sign(null, payload, { key: privateKey }),
    }).finish(),
  );
}
