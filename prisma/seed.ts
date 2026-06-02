import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());