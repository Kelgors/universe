import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@universe/server-shared/prisma";
import { env } from "./env.js";

export const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
