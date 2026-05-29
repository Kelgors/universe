import { addComponent, addEntity, IsA, set, type World } from "bitecs";
import type { Texture } from "pixi.js";
import { Sprite as PixiSprite } from "pixi.js";
import { MoveOnClick } from "../ecs/components/moveOnClick.js";
import { Sprite } from "../ecs/components/sprite.js";
import { Transform } from "../ecs/components/transform.js";
import { TrianglePrefab } from "../prefabs/triangle.js";

export function spawnTriangle(
  world: World,
  texture: Texture,
  x: number,
  y: number,
  options?: { moveOnClick?: boolean },
  tint?: number,
): number {
  const eid = addEntity(world);
  addComponent(world, eid, IsA(TrianglePrefab));
  addComponent(world, eid, set(Transform, { x, y }));

  const pixiSprite = new PixiSprite(texture);
  pixiSprite.anchor.set(0.5, 0.5);
  pixiSprite.eventMode = "none";
  if (tint) {
    pixiSprite.tint = tint;
  }
  addComponent(world, eid, set(Sprite, { sprite: pixiSprite }));

  if (options?.moveOnClick) {
    addComponent(world, eid, MoveOnClick);
  }

  return eid;
}
