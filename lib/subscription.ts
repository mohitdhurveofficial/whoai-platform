/**
 * Subscription Enforcement Constants and Helpers
 */

export const PLAN_LIMITS = {
  FREE: {
    maxAgents: 1,
  },
  STARTUP: {
    maxAgents: 5,
  },
  GROWTH: {
    maxAgents: 25,
  },
  ENTERPRISE: {
    maxAgents: 1000,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function canCreateAgent(currentAgentCount: number, plan: PlanType): boolean {
  return currentAgentCount < PLAN_LIMITS[plan].maxAgents;
}