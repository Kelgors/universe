import { prisma } from "../src/prisma.js";

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.federationEvent.deleteMany();
  await prisma.federationPlayerTransfer.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
