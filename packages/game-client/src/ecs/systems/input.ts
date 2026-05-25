import { drainClicks } from "../../input/state.js";
import type { GameWorld } from "../../plugins/bitecs.js";
import { moveOnClickSystem } from "./moveOnClick.js";

export function inputSystem(world: GameWorld): void {
  for (const click of drainClicks()) {
    moveOnClickSystem(world, click);
  }
}
