/**
 * Subscription plans and entitlement checks.
 *
 * The plan tier is stored on Organization.subscriptionTier and kept in sync
 * with Stripe by the billing webhook. Agent limits are enforced on creation.
 */

export const PLAN_LIMITS = {
  FREE: {
    maxAgents: 1,
    label: "Free",
  },
  STARTUP: {
    maxAgents: 5,
    label: "Startup",
  },
  GROWTH: {
    maxAgents: 25,
    label: "Growth",
  },
  ENTERPRISE: {
    maxAgents: 1000,
    label: "Enterprise",
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/** Normalize an arbitrary (possibly null/unknown) tier string to a PlanType. */
export function normalizeTier(tier?: string | null): PlanType {
  const key = (tier ?? "FREE").toUpperCase();
  return (key in PLAN_LIMITS ? key : "FREE") as PlanType;
}

export function planConfig(tier?: string | null) {
  return PLAN_LIMITS[normalizeTier(tier)];
}

/** True if an org on `plan` may create another agent given its current count. */
export function canCreateAgent(
  currentAgentCount: number,
  plan: PlanType | string | null | undefined,
): boolean {
  return currentAgentCount < PLAN_LIMITS[normalizeTier(plan)].maxAgents;
}

/** Map a Stripe price ID (from env) back to a plan tier. */
export function planForPriceId(priceId?: string | null): PlanType {
  if (!priceId) return "FREE";
  if (priceId === process.env.STRIPE_STARTUP_PRICE_ID) return "STARTUP";
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return "GROWTH";
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "ENTERPRISE";
  return "FREE";
}

/** Map a plan tier to its configured Stripe price ID (from env), if any. */
export function priceIdForTier(tier: PlanType): string | undefined {
  switch (tier) {
    case "STARTUP":
      return process.env.STRIPE_STARTUP_PRICE_ID;
    case "GROWTH":
      return process.env.STRIPE_GROWTH_PRICE_ID;
    case "ENTERPRISE":
      return process.env.STRIPE_ENTERPRISE_PRICE_ID;
    default:
      return undefined;
  }
}
