import type { World } from "bitecs";
import { registerTrianglePrefabs } from "./triangle.js";

export function registerPrefabs(world: World): void {
  registerTrianglePrefabs(world);
}
