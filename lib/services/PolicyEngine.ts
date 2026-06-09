import { prisma } from '@/lib/prisma'; // Use a shared singleton client
import { startOfDay, startOfMonth } from 'date-fns';

/**
 * The GovernanceEngine is the JIT (Just-In-Time) decision point.
 * It evaluates multi-tenant policies and budget constraints.
 */
export class GovernanceEngine {
  /**
   * Evaluates if an agent is allowed to make an LLM call.
   * This runs on the critical path of the Gateway.
   */
  async authorizeRequest(params: {
    agentId: string,
    organizationId: string,
    estimatedCost: number,
  }) {
    // 1. Fetch Agent with Org validation (Security)
    const agent = await prisma.agent.findUnique({
      where: { id: params.agentId, organizationId: params.organizationId },
    });

    if (!agent) {
      return { allowed: false, reason: 'AGENT_NOT_FOUND' };
    }

    if (agent.status !== 'ACTIVE') {
      return { allowed: false, reason: 'AGENT_QUARANTINED_OR_PAUSED' };
    }

    const now = new Date();
    
    // 2. Daily & Monthly Budget Checks
    // Note: For high scale, these should move to a Redis-backed counter.
    const [dailyAgg, monthlyAgg] = await Promise.all([
      prisma.spendLog.aggregate({
        where: { agentId: params.agentId, createdAt: { gte: startOfDay(now) } },
        _sum: { cost: true },
      }),
      prisma.spendLog.aggregate({
        where: { agentId: params.agentId, createdAt: { gte: startOfMonth(now) } },
        _sum: { cost: true },
      })
    ]);

    const currentDailySpend = Number(dailyAgg._sum.cost || 0);
    const currentMonthlySpend = Number(monthlyAgg._sum.cost || 0);
    
    const dailyLimit = Number(agent.dailyBudget);
    const monthlyLimit = Number(agent.monthlyBudget);

    // 3. Enforcement
    if (dailyLimit > 0 && (currentDailySpend + params.estimatedCost) > dailyLimit) {
      return { allowed: false, reason: 'AGENT_DAILY_LIMIT_EXCEEDED', killSwitch: true };
    }

    if (monthlyLimit > 0 && (currentMonthlySpend + params.estimatedCost) > monthlyLimit) {
      return { allowed: false, reason: 'AGENT_MONTHLY_LIMIT_EXCEEDED', killSwitch: true };
    }

    return { allowed: true };
  }
}