import { Transform } from "@universe/ecs-shared";
import { addComponent, addPrefab, set, type World } from "bitecs";
import { Sprite } from "../ecs/components/sprite.js";

export let TrianglePrefab = -1;

export function registerTrianglePrefabs(world: World): void {
  if (TrianglePrefab !== -1) {
    return;
  }

  TrianglePrefab = addPrefab(world);
  addComponent(world, TrianglePrefab, Transform);
  addComponent(world, TrianglePrefab, Sprite);
  addComponent(world, TrianglePrefab, set(Transform, { x: 0, y: 0 }));
}
