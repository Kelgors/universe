import { query } from "bitecs";
import type { ClickPosition } from "../../input/state.js";
import type { GameWorld } from "../../plugins/bitecs.js";
import { MoveOnClick } from "../components/moveOnClick.js";
import { Transform } from "../components/transform.js";

export function moveOnClickSystem(world: GameWorld, click: ClickPosition): void {
  for (const eid of query(world, [Transform, MoveOnClick])) {
    Transform.x[eid] = click.x;
    Transform.y[eid] = click.y;
  }
}
