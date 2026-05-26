import type { Container, Application as PixiApplication } from "pixi.js";
import { ClickType, pushClick } from "./state.js";

export type InputBindings = {
  attach: () => void;
};

export function attachInputBindings(app: PixiApplication, gameContainer: Container): InputBindings {
  const { stage } = app;
  stage.eventMode = "static";
  stage.hitArea = app.renderer.screen;

  const onPointerDown = (event: { global: { x: number; y: number } }) => {
    const local = gameContainer.toLocal(event.global);
    pushClick(ClickType.DOWN, local.x, local.y);
  };

  return {
    attach() {
      stage.on("pointerdown", onPointerDown);
    },
  };
}
