import { createServer } from "../../../../src/server.js";
import { mockNode1Config } from "../../../mock.js";

describe("Federation v1 Peers Route", () => {
  it("should return 200 OK with list of trusted peers", async () => {
    const server = createServer(mockNode1Config());
    const response = await server.inject({
      method: "GET",
      url: "/federation/v1/peers",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("peers");
    expect(response.json().peers).toBeInstanceOf(Array);
    expect(response.json().peers[0]).toMatchObject({
      nodeId: "00000000-0000-4000-8000-000000000002",
      host: { ip: "127.0.0.1", port: 8002 },
      publicKey: expect.any(String),
    });
  });
});
