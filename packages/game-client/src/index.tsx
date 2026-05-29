import { Application } from "@pixi/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameTitle } from "./components/GameTitle.js";
import "./index.css";
import type { Application as PixiApplication } from "pixi.js";
import { init as initBitecs } from "./plugins/bitecs.js";
import { init as initPixijs } from "./plugins/pixijs.js";
import { setupTempEntities } from "./spawners/index.js";

const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element "#root" not found');
}

const init = (app: PixiApplication): void => {
  initBitecs();
  initPixijs(app);
  setupTempEntities();
};

createRoot(root).render(
  <StrictMode>
    <Application resizeTo={window} onInit={init}>
      <GameTitle />
    </Application>
  </StrictMode>,
);
