import { hash, sign } from "node:crypto";
import { FederationPlayerTransferState } from "../../../../../src/generated/prisma/enums.js";
import { prisma } from "../../../../../src/prisma.js";
import { createServer } from "../../../../../src/server.js";
import { mockConfig, mockFederationTransfer, NODE2_IDENTITY } from "../../../../mock.js";

export const PLAYER1_BASE64_SNAPSHOT =
  "ewogICAgImluZGV4IjogMCwKICAgICJndWlkIjogIjkzMzdiZGNkLWQ3OTYtNGUxZC1iNmM0LTc5Y2EzM2Q0NWYwMiIsCiAgICAiaXNBY3RpdmUiOiB0cnVlLAogICAgImJhbGFuY2UiOiAiJDIsODM1LjMyIiwKICAgICJhZ2UiOiAzNSwKICAgICJmcmllbmRzIjogWwogICAgICB7CiAgICAgICAgImlkIjogMCwKICAgICAgICAibmFtZSI6ICJUd2lsYSBPbGl2ZXIiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiaWQiOiAxLAogICAgICAgICJuYW1lIjogIkNoYXJpdHkgTWlsZXMiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiaWQiOiAyLAogICAgICAgICJuYW1lIjogIkNocmlzIEJ1cmdlc3MiCiAgICAgIH0KICAgIF0sCiAgICAiZ3JlZXRpbmciOiAiSGVsbG8sIEx1ZWxsYSBHcmFoYW0hIFlvdSBoYXZlIDQgdW5yZWFkIG1lc3NhZ2VzLiIsCiAgICAiZmF2b3JpdGVGcnVpdCI6ICJiYW5hbmEiCiAgfQ==";
export const PLAYER1_BASE64_SNAPSHOT_HASH = hash("sha256", PLAYER1_BASE64_SNAPSHOT);

describe("Federation Transfers Snapshot", () => {
  it("should be a 400 when there is no body", async () => {
    const server = createServer(mockConfig());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchSnapshot();
  });

  it("should send status 400 when fields in body are missing", async () => {
    const server = createServer(mockConfig());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchSnapshot();
  });

  it("should send status 401 when nodeId is not trusted", async () => {
    const server = createServer(mockConfig());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {
        message: {
          requestId: "00000000-0000-4000-8000-000000000000",
          transferId: "00000000-0000-4000-8000-000000000001",
          snapshot: PLAYER1_BASE64_SNAPSHOT,
          snapshotHash: PLAYER1_BASE64_SNAPSHOT_HASH,
          timestamp: "2026-01-01T00:00:00.000Z",
        },
        nodeId: "2f0e3690-2888-4f02-807c-ec0b93506234",
        signature: "",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "Unrecognized node ID" });
  });

  it("should send status 401 when signature is bad", async () => {
    const server = createServer(mockConfig());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {
        message: {
          requestId: "00000000-0000-4000-8000-000000000000",
          transferId: "00000000-0000-4000-8000-000000000001",
          snapshot: PLAYER1_BASE64_SNAPSHOT,
          snapshotHash: PLAYER1_BASE64_SNAPSHOT_HASH,
          timestamp: "2026-01-01T00:00:00.000Z",
        },
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: "invalid-signature",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "Invalid signature" });
  });

  it("should send status 400 when message out of time ranges", async () => {
    const server = createServer(mockConfig());
    const message = {
      requestId: "00000000-0000-4000-8000-000000000000",
      transferId: "00000000-0000-4000-8000-000000000001",
      snapshot: PLAYER1_BASE64_SNAPSHOT,
      snapshotHash: PLAYER1_BASE64_SNAPSHOT_HASH,
      timestamp: "2026-01-02T00:00:00.000Z",
    };

    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
          key: NODE2_IDENTITY.privateKey,
        }).toString("hex"),
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchSnapshot();
  });

  it("should send status 404 when there is no transfer initiated", async () => {
    const server = createServer(mockConfig());
    const message = {
      requestId: "00000000-0000-4000-8000-000000000000",
      transferId: "00000000-0000-4000-8000-000000000001",
      snapshot: PLAYER1_BASE64_SNAPSHOT,
      snapshotHash: PLAYER1_BASE64_SNAPSHOT_HASH,
      timestamp: "2026-01-01T00:00:00.000Z",
    };

    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
          key: NODE2_IDENTITY.privateKey,
        }).toString("hex"),
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "Transfer not found" });
  });

  it("should send status 400 when transfer is not APPROVED_BY_TARGET", async () => {
    const mockTransfer = mockFederationTransfer({
      id: "00000000-0000-4000-8000-000000000001",
      state: FederationPlayerTransferState.EXPIRED,
    });
    const dbTransfer = await prisma.federationPlayerTransfer.create({ data: mockTransfer });

    const server = createServer(mockConfig());
    const message = {
      requestId: mockTransfer.requestId,
      transferId: dbTransfer.id,
      snapshot: PLAYER1_BASE64_SNAPSHOT,
      snapshotHash: PLAYER1_BASE64_SNAPSHOT_HASH,
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
          key: NODE2_IDENTITY.privateKey,
        }).toString("hex"),
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Transfer is not approved by target" });
  });

  it("should send status 409 when requestId already exists", async () => {
    await prisma.federationPlayerTransfer.create({ data: mockFederationTransfer() });

    const server = createServer(mockConfig());
    const message = {
      requestId: "00000000-0000-4000-8000-000000000000",
      sourceSystemId: "00000000-0000-4000-8000-000000000001",
      targetSystemId: "00000000-0000-4000-8000-000000000000",
      playerId: "00000000-0000-4000-8000-000000000000",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
          key: NODE2_IDENTITY.privateKey,
        }).toString("hex"),
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ error: "Transfer with the same requestId already exists" });
  });

  it("should send status 200", async () => {
    const server = createServer(mockConfig());
    const message = {
      requestId: "00000000-0000-4000-8000-000000000000",
      sourceSystemId: "00000000-0000-4000-8000-000000000001",
      targetSystemId: "00000000-0000-4000-8000-000000000000",
      playerId: "00000000-0000-4000-8000-000000000000",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
          key: NODE2_IDENTITY.privateKey,
        }).toString("hex"),
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: {
        id: expect.any(String),
        requestId: "00000000-0000-4000-8000-000000000000",
        sourceSystemId: "00000000-0000-4000-8000-000000000001",
        targetSystemId: "00000000-0000-4000-8000-000000000000",
        playerId: "00000000-0000-4000-8000-000000000000",
        timestamp: expect.any(String),
      },
      nodeId: "00000000-0000-4000-8000-000000000000",
      signature: expect.any(String),
    });
  });

  it("should save the message in the event log", async () => {
    const server = createServer(mockConfig());
    const message = {
      requestId: "00000000-0000-4000-8000-000000000000",
      sourceSystemId: "00000000-0000-4000-8000-000000000001",
      targetSystemId: "00000000-0000-4000-8000-000000000000",
      playerId: "00000000-0000-4000-8000-000000000000",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    const signature = sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
      key: NODE2_IDENTITY.privateKey,
    }).toString("hex");

    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature,
      },
    });

    expect(response.statusCode).toBe(200);
    await expect(
      prisma.federationEvent.findFirst({
        where: {
          eventType: "FEDERATION_TRANSFER_INIT",
          nodeId: "00000000-0000-4000-8000-000000000001",
          payload: { equals: JSON.stringify(message) },
          signature: signature,
        },
      }),
    ).resolves.toHaveProperty("id");
  });
});
