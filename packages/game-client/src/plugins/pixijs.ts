import { extend } from "@pixi/react";
import { type Application, Container, Graphics, Text } from "pixi.js";

extend({ Container, Graphics, Text });

export function setupDevtools(app: Application): void {
  void import("@pixi/devtools").then(({ initDevtools }) => {
    initDevtools({ app });
  });
}
