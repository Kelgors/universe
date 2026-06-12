import type { Container } from "pixi.js";
import type { GameWorld } from "../plugins/bitecs.js";
import { inputSystem } from "./systems/input.js";
import { networkSystem } from "./systems/network.js";
import { renderSystem } from "./systems/render.js";

export function update(world: GameWorld, container: Container) {
  networkSystem();
  inputSystem(world);
  renderSystem(world, container);
}
