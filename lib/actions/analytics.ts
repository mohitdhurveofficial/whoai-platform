"use server";

import { prisma } from "@/lib/prisma";

export async function getExecutiveDashboardMetrics(organizationId: string) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Total Spend
    const totalSpendMtd = await prisma.spendLog.aggregate({
      where: { organizationId },
      _sum: { costUsd: true, tokensUsed: true },
    });

    // 2 & 7. Top Expensive Agents
    const topAgentsRaw = await prisma.spendLog.groupBy({
      by: ["agentId", "model"],
      where: { organizationId },
      _sum: { costUsd: true, tokensUsed: true },
      orderBy: { _sum: { costUsd: "desc" } },
      take: 10,
    });

    const agents = await prisma.agent.findMany({
      where: { organizationId, id: { in: topAgentsRaw.map((s) => s.agentId) } },
      select: { id: true, name: true, environment: true, status: true },
    });

    const topSpenders = topAgentsRaw.map((s) => {
      const agent = agents.find((a) => a.id === s.agentId);
      return {
        id: s.agentId,
        name: agent?.name || "Unknown Agent",
        environment: agent?.environment || "UNKNOWN",
        status: agent?.status || "UNKNOWN",
        model: s.model,
        costUsd: s._sum.costUsd || 0,
        tokens: s._sum.tokensUsed || 0,
      };
    });

    // 5. Spend Trend (Last 7 Days)
    const recentLogs = await prisma.spendLog.findMany({
      where: {
        organizationId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { costUsd: true, createdAt: true },
    });

    const spendByDayMap: Record<string, number> = {};
    recentLogs.forEach((log) => {
      const date = log.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      spendByDayMap[date] = (spendByDayMap[date] || 0) + log.costUsd;
    });

    const spendByDay = Object.entries(spendByDayMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, costUsd]) => ({ date, costUsd }));

    // 6. Cost per Model
    const costByModelRaw = await prisma.spendLog.groupBy({
      by: ["model"],
      where: { organizationId },
      _sum: { costUsd: true, tokensUsed: true },
    });

    const costByModel = costByModelRaw.map((m) => ({
      model: m.model,
      costUsd: m._sum.costUsd || 0,
      tokens: m._sum.tokensUsed || 0,
    }));

    // 9 & 10. Agent Health & Active Alerts (Risks)
    const activeAlerts = await prisma.risk.findMany({
      where: { organizationId, status: "OPEN" },
      orderBy: { score: "desc" },
      take: 5,
      select: { id: true, title: true, severity: true, createdAt: true }
    });

    const activeWorkersCount = await prisma.agent.count({
      where: { organizationId, status: "ACTIVE" }
    });

    // Mocking Department Spend (Until schema is expanded)
    // Enterprise Best Practice: Add `departmentId` to `Agent` model.
    const spendByDepartment = [
      { name: "Engineering", costUsd: (totalSpendMtd._sum.costUsd || 0) * 0.5 },
      { name: "Customer Support", costUsd: (totalSpendMtd._sum.costUsd || 0) * 0.3 },
      { name: "Marketing", costUsd: (totalSpendMtd._sum.costUsd || 0) * 0.2 },
    ];

    return {
      totalSpendUsd: totalSpendMtd._sum.costUsd || 0,
      totalTokens: totalSpendMtd._sum.tokensUsed || 0,
      topSpenders,
      spendByDay,
      costByModel,
      spendByDepartment,
      activeAlerts,
      activeWorkersCount
    };
  } catch (error) {
    console.error("Failed to fetch FinOps metrics:", error);
    throw new Error("Could not retrieve spend analytics.");
  }
}