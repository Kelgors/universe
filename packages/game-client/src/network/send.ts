import { socket } from "./index.js";

type MessageType = string | ArrayBuffer;

export function sendMessage(msg: MessageType): void {
  if (!socket) {
    return;
  }

  socket.send(msg);
}
