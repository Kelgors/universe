import type { Configuration } from "../src/configuration.js";

export function mockConfig(override?: Partial<Configuration>): Configuration {
  return {
    privateKey: Buffer.from("7ff575ba2741f24317853a9ba63f82519ffa6ce155dc53ab589e911e16ca4aff", "hex"),
    publicKey: Buffer.from("7102f7229e15bc2887de14079991935ab7a6ac4383dfe7cfdfccbc01e38a1b46", "hex"),
    trustedPeers: [
      {
        id: "833ad174-d44e-45fb-a8b4-e5c77ddf6b6a",
        comment: "System Dublin Delta",
        host: { ip: "127.0.0.1", port: 8000 },
        publicKey: Buffer.from("e26b33ada5b0ecee9b70d7997aed01897e8e2d2a72f76bd95a434a5abd802a86", "hex"),
      },
    ],
    ...override,
  };
}
