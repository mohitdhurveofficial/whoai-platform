import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    console.log("ORGS:");
    console.log(JSON.stringify(orgs, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });