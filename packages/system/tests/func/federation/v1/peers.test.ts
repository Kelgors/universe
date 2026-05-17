import { createServer } from "../../../../src/server.js";
import { mockConfig } from "../../../mock.js";

describe("Federation v1 Peers Route", () => {
  const server = createServer(
    mockConfig({
      trustedPeers: [
        {
          id: "833ad174-d44e-45fb-a8b4-e5c77ddf6b6a",
          comment: "System Dublin Delta",
          host: { ip: "127.0.0.1", port: 8000 },
          publicKey: Buffer.from("e26b33ada5b0ecee9b70d7997aed01897e8e2d2a72f76bd95a434a5abd802a86", "hex"),
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
    expect(response.json()).toMatchSnapshot();
  });
});
