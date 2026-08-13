/**
 * Subscription plans and entitlement checks.
 *
 * The plan tier is stored on Organization.subscriptionTier and kept in sync
 * with Stripe by the billing webhook.
 *
 * Launch pricing (developer-led funnel, value-based expansion):
 *   Free $0 · Starter $99 · Growth $299 · Pro $799 · Enterprise custom (sales).
 *
 * Every limit here is enforced somewhere:
 *   · maxAgents        → canCreateAgent(), on agent creation
 *   · monthlyRequests  → the runtime gateway's atomic quota reservation
 *   · retentionDays    → app/api/cron/enforce-retention
 *
 * The numbers themselves live in plans.json at the project root, because the
 * Python runtime enforces the request quota and must read the same values the
 * pricing UI sells. Duplicating them in both languages is how a plan ends up
 * advertising one limit and enforcing another.
 */
import plansData from "@/plans.json";

/** Shape of a single plan entry in plans.json. `null` means unlimited. */
interface RawPlan {
  label: string;
  priceMonthly: number | null;
  maxAgents: number | null;
  monthlyRequests: number | null;
  retentionDays: number;
}

const RAW_PLANS = (plansData as { plans: Record<string, RawPlan> }).plans;

/**
 * `null` in the JSON becomes `Infinity` here so numeric comparisons
 * (`count < maxAgents`) read naturally and unlimited tiers simply never block.
 * Callers that need to render "unlimited" test with `Number.isFinite`.
 */
const unlimitedAsInfinity = (value: number | null): number => value ?? Infinity;

export const PLAN_LIMITS = {
  FREE: buildPlan("FREE"),
  STARTER: buildPlan("STARTER"),
  GROWTH: buildPlan("GROWTH"),
  PRO: buildPlan("PRO"),
  ENTERPRISE: buildPlan("ENTERPRISE"),
} as const;

function buildPlan(tier: string) {
  const raw = RAW_PLANS[tier];
  if (!raw) throw new Error(`plans.json is missing the "${tier}" plan`);
  return {
    label: raw.label,
    priceMonthly: raw.priceMonthly,
    maxAgents: unlimitedAsInfinity(raw.maxAgents),
    monthlyRequests: unlimitedAsInfinity(raw.monthlyRequests),
    retentionDays: raw.retentionDays,
  };
}

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

/**
 * Monthly request allowance for a plan, or `null` when unlimited.
 *
 * The gateway enforces this counter; this accessor exists so the billing UI
 * reports the same number the runtime actually blocks on.
 */
export function monthlyRequestQuota(plan?: PlanType | string | null): number | null {
  const quota = PLAN_LIMITS[normalizeTier(plan)].monthlyRequests;
  return Number.isFinite(quota) ? quota : null;
}

/** Telemetry retention window for a plan, in days. */
export function retentionDays(plan?: PlanType | string | null): number {
  return PLAN_LIMITS[normalizeTier(plan)].retentionDays;
}

/**
 * Compact request counts the way a pricing page writes them: 50k, 1M, 20M.
 *
 * Not Intl.NumberFormat's compact notation, which renders 50000 as "50K" and
 * 1000000 as "1M" — inconsistent casing that reads as a typo in a feature list.
 */
function formatRequests(value: number): string {
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (value >= 1_000) return `${Number((value / 1_000).toFixed(1))}k`;
  return String(value);
}

/**
 * The limit lines shown on the pricing page and in the billing UI.
 *
 * Derived rather than typed out, because the alternative — hand-written copy
 * next to enforced numbers — is how a customer ends up buying "1M requests"
 * and getting blocked at 500k. Change plans.json and the page follows.
 */
export function planLimitsCopy(tier: PlanType | string | null | undefined) {
  const plan = planConfig(tier);

  const agents = Number.isFinite(plan.maxAgents)
    ? `${plan.maxAgents} agent${plan.maxAgents === 1 ? "" : "s"}`
    : "Unlimited agents";
  const requests = Number.isFinite(plan.monthlyRequests)
    ? `${formatRequests(plan.monthlyRequests)} requests / mo`
    : "Unmetered requests";

  return {
    agents,
    requests,
    /** e.g. "2 agents · 50k requests / mo" */
    allowance: `${agents} · ${requests}`,
    /** e.g. "7-day data retention" */
    retention: `${plan.retentionDays}-day data retention`,
    /** Formatted monthly price, or null for quote-based tiers. */
    price: plan.priceMonthly === null ? null : `$${plan.priceMonthly}`,
  };
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
