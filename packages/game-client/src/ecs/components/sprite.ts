import type { Sprite as PixiSprite } from "pixi.js";

export type SpriteComponent = {
  sprite: PixiSprite;
};

export type SpriteType = {
  sprite: SpriteComponent["sprite"][];
};

export const Sprite: SpriteType = {
  sprite: [],
};
