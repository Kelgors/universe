export const ClickType = {
  DOWN: "down",
  UP: "up",
} as const;

export type ClickType = (typeof ClickType)[keyof typeof ClickType];

export type ClickPosition = {
  type: ClickType;
  x: number;
  y: number;
};

const pendingClicks: ClickPosition[] = [];

export function pushClick(type: ClickType, x: number, y: number): void {
  pendingClicks.push({ type, x, y });
}

export function drainClicks(): ClickPosition[] {
  if (pendingClicks.length === 0) return [];
  const clicks = pendingClicks.splice(0, pendingClicks.length);
  return clicks;
}
