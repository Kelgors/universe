import { createWorld, type World as GameWorld } from "bitecs";
import { registerObservers } from "../ecs/observers/index.js";
import { registerPrefabs } from "../prefabs/index.js";

export type { GameWorld };

export const world = createWorld();

let initialized = false;

export function init(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  registerObservers(world);
  registerPrefabs(world);
}
