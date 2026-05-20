import { KeyObject } from "node:crypto";
import { createServer } from "../../../../src/server.js";
import { mockConfig, NODE2_IDENTITY } from "../../../mock.js";

describe("Federation v1 Peers Route", () => {
  const server = createServer(
    mockConfig({
      trustedPeers: [
        {
          nodeId: "833ad174-d44e-45fb-a8b4-e5c77ddf6b6a",
          comment: "System Dublin Delta",
          host: { ip: "127.0.0.1", port: 8000 },
          publicKey: NODE2_IDENTITY.publicKey,
        },
      ],
    }),
  );

  it("should return 200 OK with list of trusted peers", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/federation/v1/peers",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("peers");
    expect(response.json().peers).toBeInstanceOf(Array);
    expect(response.json().peers[0]).toMatchObject({
      nodeId: "833ad174-d44e-45fb-a8b4-e5c77ddf6b6a",
      host: { ip: "127.0.0.1", port: 8000 },
      publicKey: expect.any(String),
    });
  });
});
