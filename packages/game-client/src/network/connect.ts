import { ServerSignedEnveloppe } from "@universe/game-protocol/server";
import { pushServerMessage } from "./state.js";

export let socket: WebSocket | null = null;

const WS_URL = import.meta.env.VITE_GAME_SERVER_WS_URL;
if (!WS_URL) throw new Error("VITE_GAME_SERVER_WS_URL is missing. Check your .env file.");

export function connect(): void {
  if (socket) return;

  socket = new WebSocket(WS_URL);
  socket.binaryType = "arraybuffer";

  socket.addEventListener("open", () => {
    console.info("Connected to game server.");
  });

  socket.addEventListener("message", (event) => {
    const raw = event.data;
    if (typeof raw === "string") return;

    const data = new Uint8Array(raw);
    pushServerMessage(ServerSignedEnveloppe.decode(data));
  });

  socket.addEventListener("close", () => {
    console.info("Bye.");
    socket = null;
  });
}
