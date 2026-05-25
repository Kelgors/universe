import type { Container, Ticker } from "pixi.js";
import type { GameWorld } from "../plugins/bitecs.js";
import { renderSystem } from "./systems/render.js";

export function update(world: GameWorld, container: Container, _ticker: Ticker) {
  renderSystem(world, container);
}
