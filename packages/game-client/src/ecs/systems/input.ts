import { GameCommandType, PlayerCommand } from "@universe/game-protocol/client";
import { drainClicks } from "../../input/state.js";
import { sendMessage } from "../../network/index.js";
import type { GameWorld } from "../../plugins/bitecs.js";
import { moveOnClickSystem } from "./moveOnClick.js";

export function inputSystem(world: GameWorld): void {
  for (const click of drainClicks()) {
    moveOnClickSystem(world, click);
    sendMoveToCommand(click.x, click.y);
  }
}

function sendMoveToCommand(x: number, y: number) {
  const command = PlayerCommand.encode({
    type: GameCommandType.GAME_COMMAND_TYPE_MOVE_TO,
    action: "MOVE_TO",
    payload: new TextEncoder().encode(JSON.stringify({ x, y })),
  }).finish();

  sendMessage(command);
}
