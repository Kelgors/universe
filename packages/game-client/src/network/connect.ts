export let socket: WebSocket | null = null;

const WS_URL = import.meta.env.VITE_GAME_SERVER_WS_URL;
if (!WS_URL) throw new Error("VITE_GAME_SERVER_WS_URL is missing. Check your .env file.");

export function connect(): void {
  if (socket) return;

  socket = new WebSocket(WS_URL);

  socket.addEventListener("open", () => {
    console.info("Connected to game server");
  });

  socket.addEventListener("message", (event) => {
    console.info("Server:", event.data);
  });

  socket.addEventListener("close", () => {
    console.info("Disconnected from game server");
    socket = null;
  });
}
