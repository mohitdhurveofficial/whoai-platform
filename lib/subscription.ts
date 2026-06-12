/**
 * Subscription plans and entitlement checks.
 *
 * The plan tier is stored on Organization.subscriptionTier and kept in sync
 * with Stripe by the billing webhook. Agent limits are enforced on creation.
 *
 * Launch pricing (developer-led funnel, value-based expansion):
 *   Free $0 · Starter $99 · Growth $299 · Pro $799 · Enterprise custom (sales).
 * `maxAgents` is the hard-enforced limit (see canCreateAgent). `monthlyRequests`
 * and `retentionDays` document the tier and back the pricing UI; they are not
 * yet enforced in the gateway.
 */

export const PLAN_LIMITS = {
  FREE: {
    maxAgents: 2,
    monthlyRequests: 50_000,
    retentionDays: 7,
    priceMonthly: 0,
    label: "Free",
  },
  STARTER: {
    maxAgents: 10,
    monthlyRequests: 1_000_000,
    retentionDays: 30,
    priceMonthly: 99,
    label: "Starter",
  },
  GROWTH: {
    maxAgents: 50,
    monthlyRequests: 5_000_000,
    retentionDays: 90,
    priceMonthly: 299,
    label: "Growth",
  },
  PRO: {
    maxAgents: 200,
    monthlyRequests: 20_000_000,
    retentionDays: 180,
    priceMonthly: 799,
    label: "Pro",
  },
  ENTERPRISE: {
    // Infinity → the subscription API reports "unlimited" and canCreateAgent
    // never blocks. Enterprise volume/retention are negotiated per contract
    // (priced on AI spend under management, from ~$2,000/mo annual).
    maxAgents: Infinity,
    monthlyRequests: Infinity,
    retentionDays: 365,
    priceMonthly: null,
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
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "STARTER";
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return "GROWTH";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "ENTERPRISE";
  return "FREE";
}

/** Map a plan tier to its configured Stripe price ID (from env), if any. */
export function priceIdForTier(tier: PlanType): string | undefined {
  switch (tier) {
    case "STARTER":
      return process.env.STRIPE_STARTER_PRICE_ID;
    case "GROWTH":
      return process.env.STRIPE_GROWTH_PRICE_ID;
    case "PRO":
      return process.env.STRIPE_PRO_PRICE_ID;
    case "ENTERPRISE":
      return process.env.STRIPE_ENTERPRISE_PRICE_ID;
    default:
      return undefined;
  }
}
