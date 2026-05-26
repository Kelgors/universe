# Universe

This project is a **decentralized 4X space game** where each player can host their own server to manage a part of the universe.

## Getting Started

```sh
pnpm install
pnpm exec turbo build
# For functional testing
pnpm --filter @universe/server-shared run prisma:migrate
pnpm --filter @universe/server-shared run test:migrate
```

## Packages

- game-protocol: shared library with protobuf files
- server-shared: shared library server-side (contains db schema)
- game-server: the effective game server with the ECS and websocket handler
- federation-server: the http server to handle exchanges between game-servers

