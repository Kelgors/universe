import { registerTransformObservers } from "@universe/ecs-shared";
import type { World } from "bitecs";
import { registerSpriteObservers } from "./sprite.js";

export function registerObservers(world: World): void {
  registerTransformObservers(world);
  registerSpriteObservers(world);
}
