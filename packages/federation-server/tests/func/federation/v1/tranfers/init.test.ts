import { sign, verify } from "node:crypto";
import {
  FederationError,
  SignedEnveloppe,
  TransferInitRequest,
  TransferInitResponse,
} from "@universe/game-protocol/federation";
import { createSignedEnveloppe } from "../../../../../src/crypto.js";
import { prisma } from "../../../../../src/prisma.js";
import { createServer } from "../../../../../src/server.js";
import { mockFederationTransfer, mockNode1Config, NODE2_IDENTITY } from "../../../../mock.js";

describe("Federation Transfers Init", () => {
  it("should be a 400 when there is no content type", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toHaveProperty("code", "Invalid content type");
    expect(response.statusCode).toBe(400);
  });

  it("should send status 400 when body is empty", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: Buffer.alloc(0),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toHaveProperty("code", "Missing raw body");
    expect(response.statusCode).toBe(400);
  });

  it("should send status 400 when this is not a signed message", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: Buffer.from("this is not a signed message", "utf-8"),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");

    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toEqual({
      code: "Invalid enveloppe format",
      details: "✖ Invalid UUID\n  → at nodeId",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 401 when nodeId is not trusted", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: createSignedEnveloppe(Buffer.from("test", "utf-8"), {
        privateKey: NODE2_IDENTITY.privateKey,
        nodeId: "00000000-0000-4000-8000-000000000123",
      }),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toEqual({ code: "Unknown node ID", timestamp: 1767225600000 });
    expect(response.statusCode).toBe(401);
  });

  it("should send status 401 when signature is bad", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: Buffer.from(
        SignedEnveloppe.encode({
          message: TransferInitRequest.encode({
            requestId: "00000000-0000-4000-8000-000000000000",
            sourceSystemId: "00000000-0000-4000-8000-000000000002",
            targetSystemId: "00000000-0000-4000-8000-000000000000",
            playerId: "00000000-0000-4000-8000-000000000000",
            timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
          }).finish(),
          nodeId: "00000000-0000-4000-8000-000000000002",
          signature: Buffer.from("invalid-signature", "utf-8"),
        }).finish(),
      ),

      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toEqual({ code: "Invalid signature", timestamp: 1767225600000 });
    expect(response.statusCode).toBe(401);
  });

  it("should send status 400 when payload is not valid", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: createSignedEnveloppe(
        TransferInitRequest.encode({
          requestId: "00000000-0000-4000-8000-000000000000",
          sourceSystemId: "00000000-0000-4000-8000-000000000002",
          targetSystemId: "00000000-0000-4000-8000-000000000001",
          playerId: "jaimelepaté",
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        {
          privateKey: NODE2_IDENTITY.privateKey,
          nodeId: "00000000-0000-4000-8000-000000000002",
        },
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toEqual({
      details: "✖ Invalid UUID\n  → at playerId",
      code: "Invalid message format",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 400 when source system is not the one initiating the transfer", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: createSignedEnveloppe(
        TransferInitRequest.encode({
          requestId: "00000000-0000-4000-8000-000000000000",
          sourceSystemId: "00000000-0000-4000-8000-000000000003",
          targetSystemId: "00000000-0000-4000-8000-000000000000",
          playerId: "00000000-0000-4000-8000-000000000000",
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        {
          privateKey: NODE2_IDENTITY.privateKey,
          nodeId: "00000000-0000-4000-8000-000000000002",
        },
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toEqual({
      code: "Only source system can initiate transfer",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 400 when target system is not the one accepting the transfer", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: createSignedEnveloppe(
        TransferInitRequest.encode({
          requestId: "00000000-0000-4000-8000-000000000000",
          sourceSystemId: "00000000-0000-4000-8000-000000000002",
          targetSystemId: "00000000-0000-4000-8000-000000000003",
          playerId: "00000000-0000-4000-8000-000000000000",
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        {
          privateKey: NODE2_IDENTITY.privateKey,
          nodeId: "00000000-0000-4000-8000-000000000002",
        },
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toEqual({
      code: "Only target system can accept transfer",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should send status 409 when requestId already exists", async () => {
    await prisma.federationPlayerTransfer.create({ data: mockFederationTransfer() });

    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: createSignedEnveloppe(
        TransferInitRequest.encode({
          requestId: "00000000-0000-4000-8000-000000000000",
          sourceSystemId: "00000000-0000-4000-8000-000000000002",
          targetSystemId: "00000000-0000-4000-8000-000000000001",
          playerId: "00000000-0000-4000-8000-000000000000",
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        {
          privateKey: NODE2_IDENTITY.privateKey,
          nodeId: "00000000-0000-4000-8000-000000000002",
        },
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(FederationError.decode(enveloppe.message)).toEqual({
      code: "Transfer with the same requestId already exists",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(409);
  });

  it("should send status 200", async () => {
    const server = await createServer(mockNode1Config());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: createSignedEnveloppe(
        TransferInitRequest.encode({
          requestId: "00000000-0000-4000-8000-000000000000",
          sourceSystemId: "00000000-0000-4000-8000-000000000002",
          targetSystemId: "00000000-0000-4000-8000-000000000001",
          playerId: "00000000-0000-4000-8000-000000000000",
          timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
        }).finish(),
        {
          privateKey: NODE2_IDENTITY.privateKey,
          nodeId: "00000000-0000-4000-8000-000000000002",
        },
      ),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.headers).toHaveProperty("content-type", "application/octet-stream");
    const enveloppe = SignedEnveloppe.decode(response.rawPayload);
    expect(verify(null, enveloppe.message, { key: mockNode1Config().privateKey }, enveloppe.signature)).toBe(true);
    expect(enveloppe).toHaveProperty("nodeId", mockNode1Config().nodeId);

    expect(TransferInitResponse.decode(enveloppe.message)).toEqual({
      id: expect.any(String),
      requestId: "00000000-0000-4000-8000-000000000000",
      sourceSystemId: "00000000-0000-4000-8000-000000000002",
      targetSystemId: "00000000-0000-4000-8000-000000000001",
      playerId: "00000000-0000-4000-8000-000000000000",
      timestamp: 1767225600000,
    });
    expect(response.statusCode).toBe(200);
  });

  it("should save the message in the event log", async () => {
    const server = await createServer(mockNode1Config());
    const message = TransferInitRequest.encode({
      requestId: "00000000-0000-4000-8000-000000000000",
      sourceSystemId: "00000000-0000-4000-8000-000000000002",
      targetSystemId: "00000000-0000-4000-8000-000000000001",
      playerId: "00000000-0000-4000-8000-000000000000",
      timestamp: new Date("2026-01-01T00:00:00.000Z").getTime(),
    }).finish();
    const signature = sign(null, message, { key: NODE2_IDENTITY.privateKey });
    const body = SignedEnveloppe.encode({
      nodeId: "00000000-0000-4000-8000-000000000002",
      message,
      signature,
    }).finish();
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: Buffer.from(body),
      headers: { "content-type": "application/octet-stream" },
    });

    expect(response.statusCode).toBe(200);
    await expect(
      prisma.federationEvent.findFirst({
        where: {
          eventType: "FEDERATION_TRANSFER_INIT",
          nodeId: "00000000-0000-4000-8000-000000000002",
          message,
          signature,
        },
      }),
    ).resolves.toHaveProperty("id");
  });
});
