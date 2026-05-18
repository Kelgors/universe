import { createFederationClient } from "../../../../src/lib/client.js";
import { createServer } from "../../../../src/server.js";
import { mockConfig } from "../../../mock.js";

describe("Federation v1 Health", () => {
  let shutdown: () => Promise<void>;
  let client: ReturnType<typeof createFederationClient>;

  beforeAll(async () => {
    const handle = await createServer(mockConfig(), { host: "127.0.0.1", port: 0 });
    shutdown = handle.shutdown;
    client = createFederationClient(`127.0.0.1:${handle.port}`);
  });

  afterAll(async () => {
    client.close();
    await shutdown();
  });

  it("should return ok with uptime and version", async () => {
    const response = await client.healthAsync({});

    expect(response).toHaveProperty("status", "ok");
    expect(response).toHaveProperty("uptime");
    expect(response).toHaveProperty("version", 1);
    expect(response).toHaveProperty("stage", "test");
  });
});
