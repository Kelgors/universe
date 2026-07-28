import { Transform } from "@universe/ecs-shared";
import type { ServerSetValue } from "@universe/game-protocol/server";

export function applySetValueSystem(cmd: ServerSetValue): void {
  const eid = Number(cmd.eid);
  if (Number.isNaN(eid)) return;

  const value = Number(new TextDecoder().decode(cmd.value));
  if (Number.isNaN(value)) return;

  if (cmd.cid === "Transform") {
    applyTransformValue(cmd.key, eid, value);
  }
}

function applyTransformValue(key: string, eid: number, value: number) {
  if (key === "x") {
    Transform.x[eid] = value;
  }

  if (key === "y") {
    Transform.y[eid] = value;
  }
}
