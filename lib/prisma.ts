console.log("PRISMA DATABASE_URL =", process.env.DATABASE_URL);
import { PrismaClient } from "@prisma/client";

console.log("PRISMA DATABASE URL:", process.env.DATABASE_URL);

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}