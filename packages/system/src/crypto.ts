import { type KeyObject, sign, verify } from "node:crypto";
import z from "zod";

export const signedMessageSchema = z.object({
  message: z.unknown(),
  signature: z.string(),
});
export type SignedMessage = z.infer<typeof signedMessageSchema>;

export const identifiedSignedMessageSchema = z.object({
  ...signedMessageSchema.shape,
  nodeId: z.string(),
});
export type IdentifiedSignedMessage = z.infer<typeof identifiedSignedMessageSchema>;

export function createSignedMessage<T = unknown>(message: T, privateKey: KeyObject): { message: T; signature: string } {
  const messageString = JSON.stringify(message);
  const signature = sign(null, Buffer.from(messageString, "utf-8"), { key: privateKey }).toString("hex");
  return { message, signature };
}

export function isSignatureOk(message: unknown, signature: string, publicKey: KeyObject): boolean {
  const messageString = JSON.stringify(message);
  return verify(null, Buffer.from(messageString, "utf-8"), { key: publicKey }, Buffer.from(signature, "hex"));
}
