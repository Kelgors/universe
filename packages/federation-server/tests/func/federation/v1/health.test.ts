import { createServer } from "../../../../src/server.js";
import { mockNode1Config } from "../../../mock.js";

describe("Federation v1 Health Route", () => {
  it("should return 200 OK with uptime and version", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "GET",
      url: "/federation/v1/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("status", "ok");
    expect(response.json()).toHaveProperty("uptime");
    expect(response.json()).toHaveProperty("version", 1);
    expect(response.json()).toHaveProperty("stage", "test");
  });
});
