import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      id: "cmpzfygjy0000jm045yagjkzx",
      organizationId: "cmpzfygjy0001jm04e3d1k8n1",
    },
  });

  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());