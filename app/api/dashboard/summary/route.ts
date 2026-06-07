import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

function toNumber(value: unknown): number {
  if (value instanceof Prisma.Decimal) return value.toNumber();
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return 0;
}

export async function GET() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const orgId = auth.organizationId;

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

    const spendLogCost = toNumber(spendAgg._sum.cost);
    const metricsCost = toNumber(metricsAgg._sum.totalCost);
    const totalSpend = spendLogCost || metricsCost;

    const requestLogCount = reqAgg._count._all || 0;
    const metricsRequests = toNumber(metricsAgg._sum.totalRequests);
    const totalRequests = requestLogCount || metricsRequests;

    const spendLogTokens =
      (spendAgg._sum.tokensIn || 0) +
      (spendAgg._sum.tokensOut || 0);

    const metricsTokens = toNumber(metricsAgg._sum.totalTokens);
    const totalTokens = spendLogTokens || metricsTokens;

    return NextResponse.json({
      totalSpend,
      totalRequests,
      totalTokens,
      activeAgents: activeAgentsCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}