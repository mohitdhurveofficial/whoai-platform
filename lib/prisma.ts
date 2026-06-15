import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

// Use DIRECT_URL in dev to bypass PgBouncer (which forces connection_limit=1
// and causes prepared-statement conflicts). In production keep DATABASE_URL.
function buildDatasourceUrl() {
  if (process.env.NODE_ENV !== "production" && process.env.DIRECT_URL) {
    return process.env.DIRECT_URL;
  }
  return process.env.DATABASE_URL ?? "";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
