import { ClientCommandType, ClientSignedEnveloppe, CommandMoveTo } from "@universe/game-protocol/client";
import { drainClicks } from "../../input/state.js";
import { sendMessage } from "../../network/index.js";

export function inputSystem(): void {
  for (const click of drainClicks()) {
    sendMoveToCommand(click.x, click.y);
  }
}

function sendMoveToCommand(x: number, y: number) {
  const command = ClientSignedEnveloppe.encode({
    type: ClientCommandType.CLIENT_COMMAND_TYPE_MOVE_TO,
    message: CommandMoveTo.encode({ x, y }).finish(),
    signature: new Uint8Array(),
  }).finish();

  sendMessage(command);
}
