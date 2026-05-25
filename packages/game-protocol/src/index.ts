import type { ZodType } from "zod";
import type { MessageFns } from "./generated/universe/v1/federation.js";

export type SafeDecodeResult<T> = { success: true; data: T } | { success: false; error: unknown };
export function safeDecode<T>(Message: MessageFns<T>, buffer: Uint8Array, schema: ZodType<T>): SafeDecodeResult<T> {
  try {
    return { success: true, data: schema.parse(Message.decode(buffer)) };
  } catch (error) {
    return { success: false, error };
  }
}
