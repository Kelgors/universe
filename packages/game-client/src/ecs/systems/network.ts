import { ServerCommandType, ServerSetValue } from "@universe/game-protocol/server";
import { drainServerMessages } from "../../network/state";
import { applySetValueSystem } from "./applySetValue";

export function networkSystem(): void {
  for (const envelope of drainServerMessages()) {
    switch (envelope.type) {
      // I suppose this is the method to select the value to patch ?
      case ServerCommandType.SERVER_COMMAND_TYPE_SET_VALUE: {
        const setValue = ServerSetValue.decode(envelope.message);
        applySetValueSystem(setValue);
        break;
      }
    }
  }
}
