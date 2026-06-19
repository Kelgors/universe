import { MoveToResponse, ServerCommandType, ServerSetValue } from "@universe/game-protocol/server";
import { drainServerMessages } from "../../network/state";
import type { GameWorld } from "../../plugins/bitecs";
import { applyMoveToSystem } from "./applyMoveTo";
import { applySetValueSystem } from "./applySetValue";

export function networkSystem(world: GameWorld): void {
  for (const envelope of drainServerMessages()) {
    switch (envelope.type) {
      case ServerCommandType.SERVER_COMMAND_TYPE_SET_VALUE: {
        const setValue = ServerSetValue.decode(envelope.message);
        applySetValueSystem(setValue);
        break;
      }

      case ServerCommandType.SERVER_COMMAND_TYPE_MOVE_TO: {
        const moveToValue = MoveToResponse.decode(envelope.message);
        applyMoveToSystem(world, moveToValue);
        break;
      }
    }
  }
}
