import { Application } from "@pixi/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameTitle } from "./components/GameTitle.js";
import "./index.css";
import { handlePixiInit } from "./plugins/pixijs.js";
import { setupTempEntities } from "./prefabs/index.js";

const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element "#root" not found');
}

setupTempEntities();

createRoot(root).render(
  <StrictMode>
    <Application resizeTo={window} onInit={handlePixiInit}>
      <GameTitle />
    </Application>
  </StrictMode>,
);
