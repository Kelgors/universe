export type TransformComponent = {
  x: number;
  y: number;
};

export type TransformType = {
  x: TransformComponent["x"][];
  y: TransformComponent["y"][];
};

export const Transform: TransformType = {
  x: [],
  y: [],
};
