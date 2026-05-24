import { hash, sign, verify } from "node:crypto";
import { createSignedMessage } from "../../../../../src/crypto.js";
import { FederationPlayerTransferState } from "../../../../../src/generated/prisma/enums.js";
import { PayloadError, SignedMessage } from "../../../../../src/generated/universe/federation/v1/base.js";
import {
  MobilePlayerData,
  TransferSnapshotRequest,
  TransferSnapshotResponse,
} from "../../../../../src/generated/universe/federation/v1/transfers.js";
import { prisma } from "../../../../../src/prisma.js";
import { createServer } from "../../../../../src/server.js";
import { mockFederationTransfer, mockNode1Config, mockNode2Config, NODE2_IDENTITY } from "../../../../mock.js";

describe("Federation Transfers Snapshot", () => {
  it("should be a 400 when there is no body", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toHaveProperty("error", "Invalid content type");
    expect(response.statusCode).toBe(400);
  });

  it("should send status 400 when fields in body are missing", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: Buffer.alloc(0),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toHaveProperty("error", "Missing raw body");
    expect(response.statusCode).toBe(400);
  });

  it("should send status 400 when this is not a signed message", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: Buffer.from("this is not a signed message", "utf-8"),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");

    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toEqual({
      error: "Invalid message format",
      details: "✖ Invalid UUID\n  → at nodeId",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 401 when nodeId is not trusted", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: createSignedMessage(Buffer.from("test", "utf-8"), {
        privateKey: NODE2_IDENTITY.privateKey,
        nodeId: "00000000-0000-4000-8000-000000000123",
      }),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toEqual({ error: "Unknown node ID", timestamp: 1767225600000 });
  });

  it("should send status 401 when signature is bad", async () => {
    const server = await createServer(mockNode1Config());
    const snapshotData = Buffer.from(
      MobilePlayerData.encode({
        playerId: "00000000-0000-4000-8000-000000000000",
        playerName: "PlayerOne",
      }).finish(),
    );
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: Buffer.from(
        SignedMessage.encode({
          payload: Buffer.from(
            TransferSnapshotRequest.encode({
              transferId: "00000000-0000-4000-8000-000000000001",
              requestId: "00000000-0000-4000-8000-000000000000",
              snapshotData,
              snapshotHash: hash("sha256", snapshotData),
              timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
            }).finish(),
          ),
          nodeId: "00000000-0000-4000-8000-000000000002",
          signature: Buffer.from("invalid-signature", "utf-8"),
        }).finish(),
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toEqual({ error: "Invalid signature", timestamp: 1767225600000 });
    expect(response.statusCode).toBe(401);
  });

  it("should send status 400 when message out of time ranges", async () => {
    const server = await createServer(mockNode1Config());
    const snapshotData = Buffer.from(
      MobilePlayerData.encode({
        playerId: "00000000-0000-4000-8000-000000000000",
        playerName: "PlayerOne",
      }).finish(),
    );
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: createSignedMessage(
        TransferSnapshotRequest.encode({
          transferId: "00000000-0000-4000-8000-000000000001",
          requestId: "00000000-0000-4000-8000-000000000000",
          snapshotData,
          snapshotHash: hash("sha256", snapshotData),
          timestamp: new Date("2026-01-01T00:00:31.000Z").getTime(),
        }).finish(),
        mockNode2Config(),
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toEqual({
      error: "Message out of acceptable time range",
      details: expect.any(String),
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 400 when payload is not valid", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: createSignedMessage(
        TransferSnapshotRequest.encode({
          transferId: "00000000-0000-4000-8000-000000000001",
          requestId: "j'aimelepaté",
          snapshotData: Buffer.alloc(0),
          snapshotHash: hash("sha256", Buffer.alloc(0)),
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        mockNode2Config(),
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toEqual({
      details: "✖ Invalid UUID\n  → at requestId",
      error: "Invalid payload format",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 404 when there is no transfer initiated", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: createSignedMessage(
        TransferSnapshotRequest.encode({
          transferId: "00000000-0000-4000-8000-000000000001",
          requestId: "00000000-0000-4000-8000-000000000000",
          snapshotData: Buffer.alloc(0),
          snapshotHash: hash("sha256", Buffer.alloc(0)),
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        mockNode2Config(),
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toEqual({
      error: "Transfer not found",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(404);
  });

  it("should send status 400 when transfer is not APPROVED_BY_TARGET", async () => {
    const mockTransfer = mockFederationTransfer({ state: FederationPlayerTransferState.EXPIRED });
    const { id: transferId } = await prisma.federationPlayerTransfer.create({ data: mockTransfer });

    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: createSignedMessage(
        TransferSnapshotRequest.encode({
          transferId,
          requestId: "00000000-0000-4000-8000-000000000000",
          snapshotData: Buffer.alloc(0),
          snapshotHash: hash("sha256", Buffer.alloc(0)),
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        mockNode2Config(),
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toEqual({
      error: "Transfer is not approved by target",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 400 when hash does not match the snapshot", async () => {
    const mockTransfer = mockFederationTransfer({ state: FederationPlayerTransferState.APPROVED_BY_TARGET });
    const { id: transferId } = await prisma.federationPlayerTransfer.create({ data: mockTransfer });

    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: createSignedMessage(
        TransferSnapshotRequest.encode({
          transferId,
          requestId: "00000000-0000-4000-8000-000000000000",
          snapshotData: Buffer.from("this is a snapshot", "utf-8"),
          snapshotHash: "084c799cd551dd1d8d5c5f9a5d593b2e931f5e36122ee5c793c1d08a19839cc0",
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        mockNode2Config(),
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    const dbTranfer = await prisma.federationPlayerTransfer.findFirst({
      where: {
        requestId: mockTransfer.requestId,
        id: transferId,
      },
    });

    expect(dbTranfer?.state).toBe(FederationPlayerTransferState.REJECTED_BY_TARGET_AT_SNAPSHOT);
    expect(dbTranfer?.cause).toBe("Snapshot hash does not match");

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(PayloadError.decode(message.payload)).toEqual({
      error: "Snapshot hash does not match",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 200", async () => {
    const mockTransfer = mockFederationTransfer({ state: FederationPlayerTransferState.APPROVED_BY_TARGET });
    const { id: transferId } = await prisma.federationPlayerTransfer.create({ data: mockTransfer });

    const snapshotData = Buffer.from(
      MobilePlayerData.encode({
        playerId: "00000000-0000-4000-8000-000000000000",
        playerName: "PlayerOne",
      }).finish(),
    );

    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: createSignedMessage(
        TransferSnapshotRequest.encode({
          transferId,
          requestId: "00000000-0000-4000-8000-000000000000",
          snapshotData,
          snapshotHash: hash("sha256", snapshotData),
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        mockNode2Config(),
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const message = SignedMessage.decode(response.rawPayload);
    expect(verify(null, message.payload, { key: mockNode1Config().privateKey }, message.signature)).toBe(true);
    expect(message).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(TransferSnapshotResponse.decode(message.payload)).toEqual({
      transferId,
      requestId: "00000000-0000-4000-8000-000000000000",
      timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
    });

    expect(response.statusCode).toBe(200);
  });

  it("should save the message in the event log", async () => {
    const mockTransfer = mockFederationTransfer({ state: FederationPlayerTransferState.APPROVED_BY_TARGET });
    const { id: transferId } = await prisma.federationPlayerTransfer.create({ data: mockTransfer });

    const snapshotData = Buffer.from(
      MobilePlayerData.encode({
        playerId: "00000000-0000-4000-8000-000000000000",
        playerName: "PlayerOne",
      }).finish(),
    );

    const server = await createServer(mockNode1Config());
    const payload = Buffer.from(
      TransferSnapshotRequest.encode({
        transferId,
        requestId: mockTransfer.requestId,
        snapshotData,
        snapshotHash: hash("sha256", snapshotData),
        timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
      }).finish(),
    );
    const signature = sign(null, payload, NODE2_IDENTITY.privateKey);

    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/snapshot",
      body: Buffer.from(
        SignedMessage.encode({
          payload,
          nodeId: "00000000-0000-4000-8000-000000000002",
          signature,
        }).finish(),
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.statusCode).toBe(200);
    await expect(
      prisma.federationEvent.findFirst({
        where: {
          eventType: "FEDERATION_TRANSFER_SNAPSHOT",
          nodeId: "00000000-0000-4000-8000-000000000002",
          payload,
          signature,
        },
      }),
    ).resolves.toHaveProperty("id");
  });
});
