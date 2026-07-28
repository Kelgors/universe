import type { ServerSignedEnveloppe } from "@universe/game-protocol/server";

const pendingMessages: ServerSignedEnveloppe[] = [];

export function pushServerMessage(message: ServerSignedEnveloppe): void {
  pendingMessages.push(message);
}

export function drainServerMessages(): ServerSignedEnveloppe[] {
  if (pendingMessages.length === 0) return [];
  return pendingMessages.splice(0, pendingMessages.length);
}
