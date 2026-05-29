import { useApplication } from "@pixi/react";

export function GameTitle() {
  const { app, isInitialised } = useApplication();

  if (!isInitialised) return null;

  return (
    <pixiText
      eventMode="none"
      x={Math.round(app.screen.width / 2)}
      y={10}
      anchor={{ x: 0.5, y: 0 }}
      roundPixels
      resolution={window.devicePixelRatio}
      text="Univers - Game Client"
      style={{ fill: 0xffffff, fontSize: 24 }}
    />
  );
}
