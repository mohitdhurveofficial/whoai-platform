import { prisma } from '../prisma';

export interface UpdateUsageParams {
  organizationId: string;
  agentId: string;
  tokens: number;
  cost: number;
}

export class UsageEngine {
  static async updateUsage(params: UpdateUsageParams) {
    const { organizationId, agentId, tokens, cost } = params;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Update Daily Usage Metrics
    const metrics = await prisma.usageMetrics.upsert({
      where: {
        agentId_date: {
          agentId,
          date: today,
        },
      },
      update: {
        totalRequests: { increment: 1 },
        totalTokens: { increment: tokens },
        totalCost: { increment: cost },
      },
      create: {
        organizationId,
        agentId,
        date: today,
        totalRequests: 1,
        totalTokens: tokens,
        totalCost: cost,
      },
    });

    // Update Organization Current Spend
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        currentDailySpend: { increment: cost },
        currentMonthlySpend: { increment: cost },
      },
    });

    // Update Agent Current Spend
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        currentDailySpend: { increment: cost },
        currentMonthlySpend: { increment: cost },
      },
    });

    return metrics;
  }
}
