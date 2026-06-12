import { ClientSignedEnveloppe, GameCommandType } from "@universe/game-protocol/client";
import { drainClicks } from "../../input/state.js";
import { sendMessage } from "../../network/index.js";
import type { GameWorld } from "../../plugins/bitecs.js";

export function inputSystem(world: GameWorld): void {
  for (const click of drainClicks()) {
    sendMoveToCommand(world, click.x, click.y);
  }
}

function sendMoveToCommand(world: GameWorld, x: number, y: number) {
  const command = ClientSignedEnveloppe.encode({
    playerId: world.localPlayerEid.toString(),
    message: {
      type: GameCommandType.GAME_COMMAND_TYPE_MOVE_TO,
      action: "MOVE_TO",
      payload: new TextEncoder().encode(JSON.stringify({ x, y })),
    },
    signature: new Uint8Array(),
  }).finish();

  sendMessage(command);
}
