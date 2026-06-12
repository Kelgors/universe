import { drainClicks } from "../../input/state.js";
import { sendMessage } from "../../network/index.js";
import type { GameWorld } from "../../plugins/bitecs.js";
import { moveOnClickSystem } from "./moveOnClick.js";

export function inputSystem(world: GameWorld): void {
  for (const click of drainClicks()) {
    moveOnClickSystem(world, click);

    // TODO: Serialize it using protobuf
    sendMessage(`MOVE_TO(${click.x}, ${click.y})`);
  }
}
