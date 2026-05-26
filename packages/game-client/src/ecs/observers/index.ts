import type { World } from "bitecs";
import { registerSpriteObservers } from "./sprite.js";
import { registerTransformObservers } from "./transform.js";

export function registerObservers(world: World): void {
  registerTransformObservers(world);
  registerSpriteObservers(world);
}
