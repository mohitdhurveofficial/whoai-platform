import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const orgId = "test-org-id";
  try {
    const [spendAgg, reqAgg, metricsAgg, activeAgentsCount] =
      await Promise.all([
        prisma.spendLog.aggregate({
          where: { organizationId: orgId },
          _sum: {
            cost: true,
            tokensIn: true,
            tokensOut: true,
          },
        }),

        prisma.requestLog.aggregate({
          where: { organizationId: orgId },
          _count: { _all: true },
        }),

        prisma.usageMetrics.aggregate({
          where: { organizationId: orgId },
          _sum: {
            totalCost: true,
            totalRequests: true,
            totalTokens: true,
          },
        }),

        prisma.agent.count({
          where: {
            organizationId: orgId,
            status: "ACTIVE",
          },
        }),
      ]);
    console.log("Success", { spendAgg, reqAgg, metricsAgg, activeAgentsCount });
  } catch (error) {
    console.error("Error", error);
  } finally {
    await prisma.$disconnect();
  }
}
run();
