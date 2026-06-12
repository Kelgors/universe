# Universe

This project is a **decentralized 4X space game** where each player can host their own server to manage a part of the universe.

## Getting Started

You should use the [devcontainer](https://code.visualstudio.com/docs/devcontainers/tutorial#_prerequisites) to ensure we have all the same environment.

```sh
# Install dependencies
pnpm install
# Migrate local database
pnpm --filter @universe/server-shared run prisma:migrate
# Run build
pnpm exec turbo build
```

### Other useful commands

```sh
# Running game server
pnpm --filter @universe/game-server run dev
# Run lint & formatting checks
pnpm exec turbo check
# Run tests
pnpm --filter @universe/server-shared run test:migrate
pnpm exec turbo test -- --passWithNoTests
```

## Packages

- game-protocol: shared library with protobuf files
- server-shared: shared library server-side (contains db schema)
- ecs-shared: shared library client-server (contains ECS shared definitions)
- game-server: the effective game server with the ECS and websocket handler
- game-client: A web based game client
- federation-server: the http server to handle exchanges between game-servers

