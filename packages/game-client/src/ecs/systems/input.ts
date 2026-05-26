import type { Ticker } from "pixi.js";
import { drainClicks } from "../../input/state.js";
import type { GameWorld } from "../../plugins/bitecs.js";
import { moveOnClickSystem, setDestination } from "./inputSubSystems/moveOnClick.js";

export function inputSystem(world: GameWorld, ticker: Ticker): void {
  for (const click of drainClicks()) {
    setDestination(world, click);
  }

  moveOnClickSystem(world, ticker);
}
