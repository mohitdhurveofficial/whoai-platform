import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.organization.create({
    data: {
      id: "cmpzfygjy0001jm04e3d1k8n1",
      name: "WHOAI",
      slug: "whoai",
    },
  });

  await prisma.user.create({
    data: {
      id: "cmpzfygjy0000jm045yagjkzx",
      organizationId: "cmpzfygjy0001jm04e3d1k8n1",
      email: "mohitdhurveofficial@gmail.com",
      role: "OWNER",
      fullName: "Mohit Dhurve",
    },
  });

  console.log("Seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());