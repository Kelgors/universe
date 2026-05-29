import { extend } from "@pixi/react";
import { type Application, Graphics, Text } from "pixi.js";
import { update, world } from "../ecs/index.js";
import { attachInputBindings } from "../input/bindings.js";

extend({ Graphics, Text });

export function setupDevtools(app: Application): void {
  void import("@pixi/devtools").then(({ initDevtools }) => {
    initDevtools({ app });
  });
}

export function init(app: Application): void {
  app.ticker.maxFPS = 60;

  if (import.meta.env.DEV) {
    setupDevtools(app);
  }

  attachInputBindings(app, app.stage);

  const onTick = () => update(world, app.stage);
  app.ticker.add(onTick);
}
