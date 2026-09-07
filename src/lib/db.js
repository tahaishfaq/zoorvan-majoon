import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis;
export const db = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
export const databaseConfigured =
  Boolean(process.env.DATABASE_URL) && process.env.STORE_PREVIEW !== "true";
