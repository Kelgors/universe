import { Transform } from "@universe/ecs-shared";
import type { MoveToResponse } from "@universe/game-protocol/server";
import type { GameWorld } from "../../plugins/bitecs";

export function applyMoveToSystem(world: GameWorld, cmd: MoveToResponse): void {
  Transform.x[world.localPlayerEid] = cmd.targetX;
  Transform.y[world.localPlayerEid] = cmd.targetY;
}
