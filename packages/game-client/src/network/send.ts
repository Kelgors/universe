import { socket } from "./index.js";

type MessageType = string | ArrayBuffer | Uint8Array<ArrayBuffer>;

export function sendMessage(msg: MessageType): void {
  if (!socket) {
    return;
  }

  socket.send(msg);
}
