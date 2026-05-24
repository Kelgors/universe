import type { ZodType } from "zod";
import type { MessageFns } from "../generated/universe/federation/v1/base.js";

type SafeDecodeResult<T> = { success: true; data: T } | { success: false; error: unknown };
export function safeDecode<T>(Message: MessageFns<T>, buffer: Buffer, schema: ZodType<T>): SafeDecodeResult<T> {
  try {
    return { success: true, data: schema.parse(Message.decode(buffer)) };
  } catch (error) {
    return { success: false, error };
  }
}
