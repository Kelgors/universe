import { createFederationClient } from "../../../../src/lib/client.js";
import { createServer } from "../../../../src/server.js";
import { mockConfig } from "../../../mock.js";

describe("Federation v1 Peers", () => {
  let shutdown: () => Promise<void>;
  let client: ReturnType<typeof createFederationClient>;

  beforeAll(async () => {
    const handle = await createServer(
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
      { host: "127.0.0.1", port: 0 },
    );
    shutdown = handle.shutdown;
    client = createFederationClient(`127.0.0.1:${handle.port}`);
  });

  afterAll(async () => {
    client.close();
    await shutdown();
  });

  it("should return the list of trusted peers", async () => {
    const response = await client.listPeersAsync({});

    expect(response).toMatchSnapshot();
  });
});
