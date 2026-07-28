import { createWorld, type World } from "bitecs";
import { registerObservers } from "../ecs/observers/index.js";
import { registerPrefabs } from "../prefabs/index.js";

interface WorldConfig {
  localPlayerEid: number;
}

export type GameWorld = World<WorldConfig>;

export const world = createWorld({ localPlayerEid: -1 });

let initialized = false;

export function init(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  registerObservers(world);
  registerPrefabs(world);
}
