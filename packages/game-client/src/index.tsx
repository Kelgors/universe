import { addComponent, addEntity } from "bitecs";
import { Assets, Sprite as PixiSprite } from "pixi.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Sprite, Transform, world } from "./ecs/index.js";
import "./index.css";
import "./plugins/pixijs";
import { GameCanvas } from "./GameCanvas";

const TRIANGLE_TEXTURE = "assets/triangle.png";

async function setupTempEntities() {
  const texture = await Assets.load(TRIANGLE_TEXTURE);

  const eid = addEntity(world);
  addComponent(world, eid, Transform);
  addComponent(world, eid, Sprite);
  Transform.x[eid] = 100;
  Transform.y[eid] = 100;
  Sprite.sprite[eid] = new PixiSprite(texture);

  const eid2 = addEntity(world);
  addComponent(world, eid2, Transform);
  addComponent(world, eid2, Sprite);
  Transform.x[eid2] = 200;
  Transform.y[eid2] = 100;
  Sprite.sprite[eid2] = new PixiSprite(texture);
}

void setupTempEntities();

const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element "#root" not found');
}

createRoot(root).render(
  <StrictMode>
    <GameCanvas />
  </StrictMode>,
);
