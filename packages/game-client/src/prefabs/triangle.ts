import { addComponent, addEntity, type World } from "bitecs";
import type { Texture } from "pixi.js";
import { Sprite as PixiSprite } from "pixi.js";
import { MoveOnClick, Sprite, Transform } from "../ecs/index.js";

export function spawnTriangle(
  world: World,
  texture: Texture,
  x: number,
  y: number,
  options?: { moveOnClick?: boolean },
): number {
  const eid = addEntity(world);
  addComponent(world, eid, Transform);
  addComponent(world, eid, Sprite);
  if (options?.moveOnClick) {
    addComponent(world, eid, MoveOnClick);
  }
  Transform.x[eid] = x;
  Transform.y[eid] = y;

  const pixiSprite = new PixiSprite(texture);
  pixiSprite.anchor.set(0.5, 0.5);
  pixiSprite.eventMode = "none";

  Sprite.sprite[eid] = pixiSprite;

  return eid;
}
