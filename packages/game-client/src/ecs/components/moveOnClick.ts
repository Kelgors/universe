export type MoveOnClickComponent = {
  targetX: number;
  targetY: number;
};

export type MoveOnClickType = {
  targetX: MoveOnClickComponent["targetX"][];
  targetY: MoveOnClickComponent["targetY"][];
};

export const MoveOnClick: MoveOnClickType = {
  targetX: [],
  targetY: [],
};
