import { sign } from "node:crypto";
import { prisma } from "../../../../../src/prisma.js";
import { createServer } from "../../../../../src/server.js";
import { mockConfig, mockFederationTransfer, NODE2_IDENTITY } from "../../../../mock.js";

describe("Federation Transfers Init", () => {
  it("should be a 400 when there is no body", async () => {
    const server = createServer(mockConfig());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchSnapshot();
  });

  it("should send status 400 when fields in body are missing", async () => {
    const server = createServer(mockConfig());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchSnapshot();
  });

  it("should send status 401 when nodeId is not trusted", async () => {
    const server = createServer(mockConfig());
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: {
        message: {
          requestId: "00000000-0000-4000-8000-000000000000",
          sourceSystemId: "00000000-0000-4000-8000-000000000001",
          targetSystemId: "2f0e3690-2888-4f02-807c-ec0b93506234",
          playerId: "00000000-0000-4000-8000-000000000000",
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
      url: "/federation/v1/transfers/init",
      body: {
        message: {
          requestId: "00000000-0000-4000-8000-000000000000",
          sourceSystemId: "00000000-0000-4000-8000-000000000001",
          targetSystemId: "00000000-0000-4000-8000-000000000000",
          playerId: "00000000-0000-4000-8000-000000000000",
          timestamp: "2026-01-01T00:00:00.000Z",
        },
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: "invalid-signature",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "Invalid signature" });
  });

  it("should send status 400 when message is not valid", async () => {
    await prisma.federationPlayerTransfer.create({ data: mockFederationTransfer() });

    const server = createServer(mockConfig());
    const message = {
      requestId: "00000000-0000-4000-8000-000000000000",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
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

  it("should send status 400 when source system is not the one initiating the transfer", async () => {
    const server = createServer(mockConfig());
    const message = {
      requestId: "00000000-0000-4000-8000-000000000000",
      sourceSystemId: "00000000-0000-4000-8000-000000000003",
      targetSystemId: "00000000-0000-4000-8000-000000000000",
      playerId: "00000000-0000-4000-8000-000000000000",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
          key: NODE2_IDENTITY.privateKey,
        }).toString("hex"),
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Bad Request",
      message: "Only source system can initiate transfer",
      statusCode: 400,
    });
  });

  it("should send status 400 when target system is not the one accepting the transfer", async () => {
    const server = createServer(mockConfig());
    const message = {
      requestId: "00000000-0000-4000-8000-000000000000",
      sourceSystemId: "00000000-0000-4000-8000-000000000001",
      targetSystemId: "00000000-0000-4000-8000-000000000003",
      playerId: "00000000-0000-4000-8000-000000000000",
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    const response = await server.inject({
      method: "POST",
      url: "/federation/v1/transfers/init",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
          key: NODE2_IDENTITY.privateKey,
        }).toString("hex"),
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Bad Request",
      message: "Only target system can accept transfer",
      statusCode: 400,
    });
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
      url: "/federation/v1/transfers/init",
      body: {
        message: message,
        nodeId: "00000000-0000-4000-8000-000000000001",
        signature: sign(null, Buffer.from(JSON.stringify(message), "utf-8"), {
          key: NODE2_IDENTITY.privateKey,
        }).toString("hex"),
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: "Conflict",
      message: "Transfer with the same requestId already exists",
      statusCode: 409,
    });
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
      url: "/federation/v1/transfers/init",
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
      url: "/federation/v1/transfers/init",
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
