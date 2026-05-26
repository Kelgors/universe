import { extend } from "@pixi/react";
import { type Application, Container, Graphics, Text } from "pixi.js";
import { update, world } from "../ecs/index.js";
import { attachInputBindings } from "../input/bindings.js";

extend({ Container, Graphics, Text });

export function setupDevtools(app: Application): void {
  void import("@pixi/devtools").then(({ initDevtools }) => {
    initDevtools({ app });
  });
}

export function handlePixiInit(app: Application): void {
  app.ticker.maxFPS = 60;

  if (import.meta.env.DEV) {
    setupDevtools(app);
  }

  const container = new Container();
  app.stage.addChild(container);

  const inputBindings = attachInputBindings(app, container);
  inputBindings.attach();

  const onTick = () => update(world, container, app.ticker);
  app.ticker.add(onTick);
}
