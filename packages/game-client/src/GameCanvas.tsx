import { Application } from "@pixi/react";
import type { Application as PixiApplication } from "pixi.js";
import { Container } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { GameTitle } from "./components/GameTitle.js";
import * as ecs from "./ecs";
import { attachInputBindings } from "./input/bindings.js";
import { setupDevtools } from "./plugins/pixijs.js";

export function GameCanvas() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleInit = useCallback((app: PixiApplication) => {
    cleanupRef.current?.();

    app.ticker.maxFPS = 60;

    if (import.meta.env.DEV) {
      setupDevtools(app);
    }

    const container = new Container();
    app.stage.addChild(container);

    const inputBindings = attachInputBindings(app, container);
    inputBindings.attach();

    const onTick = () => ecs.update(ecs.world, container, app.ticker);
    app.ticker.add(onTick);

    cleanupRef.current = () => {
      inputBindings.detach();
      app.ticker.remove(onTick);
      app.stage.removeChild(container);
      container.destroy();
    };
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return (
    <Application resizeTo={window} backgroundColor={0x1a1a2e} onInit={handleInit}>
      <GameTitle />
    </Application>
  );
}
