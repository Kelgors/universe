import type { Container, Ticker } from "pixi.js";
import type { GameWorld } from "../plugins/bitecs.js";
import { inputSystem } from "./systems/input.js";
import { renderSystem } from "./systems/render.js";

export function update(world: GameWorld, container: Container, ticker: Ticker) {
  inputSystem(world, ticker);
  renderSystem(world, container);
}
