import { GameCommandType, PlayerCommand } from "@universe/game-protocol/client";
import { drainClicks } from "../../input/state.js";
import { sendMessage } from "../../network/index.js";
import type { GameWorld } from "../../plugins/bitecs.js";
import { moveOnClickSystem } from "./moveOnClick.js";

export function inputSystem(world: GameWorld): void {
  for (const click of drainClicks()) {
    moveOnClickSystem(world, click);

    const command = PlayerCommand.encode({
      type: GameCommandType.GAME_COMMAND_TYPE_MOVE_TO,
      action: "MOVE_TO",
      payload: new TextEncoder().encode(JSON.stringify({ x: click.x, y: click.y })),
    }).finish();

    sendMessage(command);
  }
}
