import { type KeyObject, sign, verify } from "node:crypto";
import z, { type ZodType } from "zod";
import type { Configuration } from "./configuration.js";

export type SignedMessage<T = unknown> = {
  message: T;
  nodeId: string;
  signature: string;
};

export function createSignedMessageSchema<T = unknown>(payload: ZodType<T>): ZodType<SignedMessage<T>> {
  return z.object({
    message: payload,
    nodeId: z.string(),
    signature: z.string(),
  });
}

export function createSignedMessage<T = unknown>(
  message: T,
  { privateKey, nodeId }: Pick<Configuration, "privateKey" | "nodeId">,
): SignedMessage {
  const messageString = JSON.stringify(message);
  const signature = sign(null, Buffer.from(messageString, "utf-8"), { key: privateKey }).toString("hex");
  return { message, nodeId, signature };
}

export function isSignatureOk(message: unknown, signature: string, publicKey: KeyObject): boolean {
  const messageString = JSON.stringify(message);
  return verify(null, Buffer.from(messageString, "utf-8"), { key: publicKey }, Buffer.from(signature, "hex"));
}
