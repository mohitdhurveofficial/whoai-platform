import { prisma } from '../prisma';
import { AlertEngine, AlertType, AlertSeverity } from '../alert-engine';
import { Prisma } from '@prisma/client';

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
}

export class BudgetEngine {
  static async checkAgentBudget(agentId: string, requestedCost: number): Promise<BudgetCheckResult> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { organization: true },
    });

    if (!agent) {
      return { allowed: false, reason: 'Agent not found' };
    }

    if (agent.status !== 'ACTIVE') {
      return { allowed: false, reason: `Agent is ${agent.status}` };
    }

    const currentDailySpend = Number(agent.currentDailySpend || 0);
    const dailyBudget = Number(agent.dailyBudget || 0);
    const projectedDailySpend = currentDailySpend + requestedCost;

    if (dailyBudget > 0 && projectedDailySpend > dailyBudget) {
      await this.recordViolation(agent.organizationId, agent.id, 'AGENT_DAILY_LIMIT', projectedDailySpend, dailyBudget);
      await AlertEngine.createAlert({
        organizationId: agent.organizationId,
        agentId: agent.id,
        type: AlertType.AGENT_LIMIT_REACHED,
        severity: AlertSeverity.HIGH,
        title: 'Agent Daily Budget Exceeded',
        message: `Agent ${agent.name} has exceeded its daily budget of $${dailyBudget}`,
        metadata: { currentDailySpend, requestedCost, dailyBudget },
      });
      return { allowed: false, reason: 'Agent daily budget exceeded' };
    }

    const currentMonthlySpend = Number(agent.currentMonthlySpend || 0);
    const monthlyBudget = Number(agent.monthlyBudget || 0);
    const projectedMonthlySpend = currentMonthlySpend + requestedCost;

    if (monthlyBudget > 0 && projectedMonthlySpend > monthlyBudget) {
      await this.recordViolation(agent.organizationId, agent.id, 'AGENT_MONTHLY_LIMIT', projectedMonthlySpend, monthlyBudget);
      await AlertEngine.createAlert({
        organizationId: agent.organizationId,
        agentId: agent.id,
        type: AlertType.AGENT_LIMIT_REACHED,
        severity: AlertSeverity.HIGH,
        title: 'Agent Monthly Budget Exceeded',
        message: `Agent ${agent.name} has exceeded its monthly budget of $${monthlyBudget}`,
        metadata: { currentMonthlySpend, requestedCost, monthlyBudget },
      });
      return { allowed: false, reason: 'Agent monthly budget exceeded' };
    }

    // Also check organization budget
    const org = agent.organization;
    const orgCurrentDailySpend = Number(org.currentDailySpend || 0);
    const orgDailyBudget = Number(org.dailyBudget || 0);
    const orgProjectedDailySpend = orgCurrentDailySpend + requestedCost;

    if (orgDailyBudget > 0 && orgProjectedDailySpend > orgDailyBudget) {
      await this.recordViolation(org.id, agent.id, 'ORG_DAILY_LIMIT', orgProjectedDailySpend, orgDailyBudget);
      await AlertEngine.createAlert({
        organizationId: org.id,
        type: AlertType.ORG_LIMIT_REACHED,
        severity: AlertSeverity.CRITICAL,
        title: 'Organization Daily Budget Exceeded',
        message: `Organization has exceeded its daily budget of $${orgDailyBudget}`,
        metadata: { orgCurrentDailySpend, requestedCost, orgDailyBudget },
      });
      return { allowed: false, reason: 'Organization daily budget exceeded' };
    }

    const orgCurrentMonthlySpend = Number(org.currentMonthlySpend || 0);
    const orgMonthlyBudget = Number(org.monthlyBudget || 0);
    const orgProjectedMonthlySpend = orgCurrentMonthlySpend + requestedCost;

    if (orgMonthlyBudget > 0 && orgProjectedMonthlySpend > orgMonthlyBudget) {
      await this.recordViolation(org.id, agent.id, 'ORG_MONTHLY_LIMIT', orgProjectedMonthlySpend, orgMonthlyBudget);
      await AlertEngine.createAlert({
        organizationId: org.id,
        type: AlertType.ORG_LIMIT_REACHED,
        severity: AlertSeverity.CRITICAL,
        title: 'Organization Monthly Budget Exceeded',
        message: `Organization has exceeded its monthly budget of $${orgMonthlyBudget}`,
        metadata: { orgCurrentMonthlySpend, requestedCost, orgMonthlyBudget },
      });
      return { allowed: false, reason: 'Organization monthly budget exceeded' };
    }

    return { allowed: true };
  }

  static async recordViolation(organizationId: string, agentId: string | null, violationType: string, currentSpend: number, budgetLimit: number) {
    await prisma.budgetViolation.create({
      data: {
        organizationId,
        agentId,
        violationType,
        currentSpend: new Prisma.Decimal(currentSpend),
        budgetLimit: new Prisma.Decimal(budgetLimit),
      },
    });
  }
}
