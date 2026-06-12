import { socket } from "./index.js";

type MessageType = string | ArrayBufferLike | Blob | ArrayBufferView;

export function sendMessage(msg: MessageType): void {
  if (!socket) {
    return;
  }

  socket.send(msg);
}
