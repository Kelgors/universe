import { observe, onGet, onSet, type World } from "bitecs";
import { Sprite, type SpriteComponent } from "../components/sprite.js";

export function registerSpriteObservers(world: World): void {
  observe(world, onSet(Sprite), (eid, params: Partial<SpriteComponent>) => {
    if (params.sprite !== undefined) {
      Sprite.sprite[eid] = params.sprite;
    }
  });

  observe(world, onGet(Sprite), (eid) => ({
    sprite: Sprite.sprite[eid],
  }));
}
