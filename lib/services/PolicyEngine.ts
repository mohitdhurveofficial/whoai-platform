import { PrismaClient } from '@prisma/client';
import { startOfDay } from 'date-fns';

/**
 * The GovernanceEngine is the JIT (Just-In-Time) decision point.
 * It evaluates multi-tenant policies and budget constraints.
 */
export class GovernanceEngine {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * evaluates if an agent is allowed to make an LLM call.
   * This runs on the critical path of the Gateway.
   */
  async authorizeRequest(params: {
    agentId: string,
    orgId: string,
    model: string,
    estimatedCost: number
  }) {
    // 1. Fetch Agent (Critical Path)
    const agent = await this.prisma.agent.findUnique({
      where: { id: params.agentId },
    });

    if (!agent) {
      return { allowed: false, reason: 'AGENT_NOT_FOUND' };
    }

    if (agent.status !== 'ACTIVE') {
      return { allowed: false, reason: 'AGENT_QUARANTINED_OR_PAUSED' };
    }

    // 2. Hard Budget Check
    // Optimized for the first 10 customers: Direct DB aggregate.
    const today = startOfDay(new Date());
    const spendLogs = await this.prisma.spendLog.aggregate({
      where: { agentId: params.agentId, createdAt: { gte: today } },
      _sum: { cost: true },
    });

    const currentDailySpend = Number(spendLogs._sum.cost || 0);
    const dailyLimit = Number(agent.dailyBudget);

    // If adding this request goes over the limit, KILL IT.
    if (dailyLimit > 0 && currentDailySpend + params.estimatedCost > dailyLimit) {
      return { allowed: false, reason: 'DAILY_BUDGET_EXCEEDED', killSwitch: true };
    }

    return { allowed: true };
  }
}