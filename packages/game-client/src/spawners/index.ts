import { Assets } from "pixi.js";
import { world } from "../plugins/bitecs.js";
import { spawnTriangle } from "./triangle.js";

export const TRIANGLE_TEXTURE = "assets/triangle.png";

export async function setupTempEntities(): Promise<void> {
  const texture = await Assets.load(TRIANGLE_TEXTURE);

  spawnTriangle(world, texture, 200, 100, 0xff0000);
  world.localPlayerEid = spawnTriangle(world, texture, 100, 100);
}
