import type { Container } from "pixi.js";
import type { GameWorld } from "../plugins/bitecs.js";
import { inputSystem } from "./systems/input.js";
import { renderSystem } from "./systems/render.js";

export function update(world: GameWorld, container: Container) {
  inputSystem(world);
  renderSystem(world, container);
}
