import { Transform } from "@universe/ecs-shared";
import { query } from "bitecs";
import type { Container } from "pixi.js";
import type { GameWorld } from "../../plugins/bitecs.js";
import { Sprite } from "../components/sprite.js";

export function renderSystem(world: GameWorld, container: Container) {
  for (const eid of query(world, [Transform, Sprite])) {
    const sprite = Sprite.sprite[eid];
    if (!sprite) continue;

    sprite.x = Transform.x[eid];
    sprite.y = Transform.y[eid];

    if (sprite.parent !== container) {
      container.addChild(sprite);
    }
  }
}
