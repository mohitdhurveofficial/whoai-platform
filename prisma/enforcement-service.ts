import { prisma } from "@/lib/prisma";
import { startOfDay, startOfMonth } from "date-fns";

export type PolicyResult = {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
};

/**
 * GovernanceService handles Identity-linked policy enforcement.
 * It evaluates Cost, Access, and Governance rules in a single pass.
 */
export class GovernanceService {
  static async evaluate(
    agentId: string, 
    organizationId: string, 
    actionContext: { 
      type: string; 
      costEstimate?: number;
      targetResource?: string; // e.g. "github", "stripe"
    }
  ): Promise<PolicyResult> {
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, organizationId },
      include: {
        policies: {
          where: { isActive: true },
          orderBy: { priority: 'asc' }
        },
        identity: true,
        permissions: true
      }
    });

    // 1. Identity Check
    if (!agent || agent.status === "INACTIVE") {
      return { allowed: false, reason: "AGENT_INACTIVE" };
    }

    // 1.5 Permission Check
    if (actionContext.targetResource) {
      const hasPermission = agent.permissions.some(p => 
        p.resource === actionContext.targetResource && 
        p.action === actionContext.type
      );

      if (!hasPermission) {
        return { allowed: false, reason: `INSUFFICIENT_PERMISSIONS: ${actionContext.targetResource}:${actionContext.type}` };
      }
    }

    // 2. Policy Evaluation
    for (const policy of agent.policies) {
      const rules = policy.ruleSet as { restrictedTypes?: string[], requiresApprovalFor?: string[] };
      
      if (!rules) continue;

      if (rules.restrictedTypes?.includes(actionContext.type)) {
        return { allowed: false, reason: `Policy Violation: ${policy.name}` };
      }
      if (rules.requiresApprovalFor?.includes(actionContext.type)) {
        return { allowed: false, requiresApproval: true, reason: "Action Requires Approval" };
      }
    }

    const now = new Date();
    
    // 2. Cost Policy Evaluation
    const spendData = await prisma.spendLog.aggregate({
      where: {
        agentId,
        organizationId,
        createdAt: { gte: startOfMonth(now) }
      },
      _sum: { costUsd: true }
    });

    const totalMonthlySpend = spendData._sum.costUsd || 0;

    if (agent.monthlyBudget && totalMonthlySpend >= agent.monthlyBudget) {
      await this.triggerLockdown(agentId, "MONTHLY_BUDGET_EXCEEDED");
      return { allowed: false, reason: "MONTHLY_BUDGET_EXCEEDED" };
    }

    const dailySpendData = await prisma.spendLog.aggregate({
        where: { agentId, createdAt: { gte: startOfDay(now) } },
        _sum: { costUsd: true }
    });
    
    const totalDailySpend = dailySpendData._sum.costUsd || 0;

    if (agent.dailyBudget && totalDailySpend >= agent.dailyBudget) {
      return { allowed: false, reason: "DAILY_BUDGET_EXCEEDED" };
    }

    // 3. Action-Specific Governance (e.g. High Value Actions)
    if (actionContext.costEstimate && actionContext.costEstimate > 5.0) {
      return { allowed: false, requiresApproval: true, reason: "HIGH_COST_ACTION" };
    }

    // 3. Human-In-The-Loop (HITL) Triggers
    // Check if the current action type requires approval based on policy
    const needsApproval = agent.policies.some(p => {
      const rules = p.ruleSet as { requiresApprovalFor?: string[] };
      return rules?.requiresApprovalFor?.includes(actionContext.type);
    });

    if (needsApproval) {
      return { allowed: false, requiresApproval: true, reason: "PENDING_HUMAN_APPROVAL" };
    }

    return { allowed: true };
  }

  /**
   * Lockdown deactivates the agent token and logs a high-severity alert.
   */
  private static async triggerLockdown(agentId: string, reason: string) {
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "INACTIVE" }
    });
    
    // Integration with Alerting system
    console.error(`[GOVERNANCE] Agent ${agentId} locked down: ${reason}`);
  }
}