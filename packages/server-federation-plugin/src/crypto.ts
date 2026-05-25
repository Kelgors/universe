import { sign } from "node:crypto";
import { SignedEnveloppe } from "@universe/game-protocol/federation";
import type { Configuration } from "@universe/server-shared";

export function createSignedEnveloppe(
  message: Uint8Array,
  { privateKey, nodeId }: Pick<Configuration, "privateKey" | "nodeId">,
): Buffer {
  return Buffer.from(
    SignedEnveloppe.encode({ nodeId, message, signature: sign(null, message, { key: privateKey }) }).finish(),
  );
}
