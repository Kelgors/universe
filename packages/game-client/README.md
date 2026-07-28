# game-client

## Setup

From the repository root:

```sh
pnpm install
```

Create a `.env` file in this package:

```env
VITE_GAME_SERVER_WS_URL="ws://localhost:3000/"
```

Start the game server (from the repository root):

```sh
pnpm --filter @universe/game-server run dev
```

## Run

```sh
pnpm --filter game-client run dev
```

Open the URL shown in the terminal (default: http://localhost:5173).
