import { query } from "bitecs";
import type { Ticker } from "pixi.js";
import type { ClickPosition } from "../../../input/state.js";
import type { GameWorld } from "../../../plugins/bitecs.js";
import { MoveOnClick } from "../../components/moveOnClick.js";
import { Transform } from "../../components/transform.js";

const MOVE_SPEED = 400;
const ARRIVAL_THRESHOLD = 0.5;

export function setDestination(world: GameWorld, click: ClickPosition): void {
  for (const eid of query(world, [Transform, MoveOnClick])) {
    MoveOnClick.targetX[eid] = click.x;
    MoveOnClick.targetY[eid] = click.y;
  }
}

export function moveOnClickSystem(world: GameWorld, ticker: Ticker): void {
  const step = MOVE_SPEED * (ticker.deltaMS / 1000);

  for (const eid of query(world, [Transform, MoveOnClick])) {
    const dx = MoveOnClick.targetX[eid] - Transform.x[eid];
    const dy = MoveOnClick.targetY[eid] - Transform.y[eid];
    const distance = Math.hypot(dx, dy);

    if (distance <= ARRIVAL_THRESHOLD) {
      Transform.x[eid] = MoveOnClick.targetX[eid];
      Transform.y[eid] = MoveOnClick.targetY[eid];
      continue;
    }

    const ratio = Math.min(1, step / distance);
    Transform.x[eid] += dx * ratio;
    Transform.y[eid] += dy * ratio;
  }
}
