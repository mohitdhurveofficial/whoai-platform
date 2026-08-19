/**
 * Subscription plans and entitlement checks.
 *
 * The plan tier is stored on Organization.subscriptionTier and kept in sync
 * with Stripe by the billing webhook.
 *
 * Pricing (developer-led funnel, value-based expansion):
 *   Free $0 · Starter $149 · Growth $499 · Business $1,499 · Enterprise custom (sales).
 *
 * Every limit here is enforced somewhere:
 *   · maxAgents        → canCreateAgent(), on agent creation
 *   · monthlyRequests  → the runtime gateway's atomic quota reservation
 *   · retentionDays    → app/api/cron/enforce-retention
 *   · features         → requireFeature() in lib/server/guard, at each route
 *
 * The numbers themselves live in plans.json at the project root, because the
 * Python runtime enforces the request quota and must read the same values the
 * pricing UI sells. Duplicating them in both languages is how a plan ends up
 * advertising one limit and enforcing another.
 */
import plansData from "@/plans.json";

/**
 * Capability gates, as opposed to the volume limits above.
 *
 * Named individually rather than as `Record<string, boolean>` so that a typo in
 * a call site — `hasFeature(tier, "killswitch")` — is a compile error instead of
 * a silent `undefined` that reads as "denied" and quietly breaks a paid feature.
 */
export type FeatureKey =
  | "budgetEnforcement"
  | "killSwitch"
  | "multiProviderRouting"
  | "providerFailover"
  | "anomalyDetection"
  | "rbac"
  | "policyEnforcement"
  | "advancedAnalytics"
  | "auditExport"
  | "sso";

/** Shape of a single plan entry in plans.json. `null` means unlimited. */
interface RawPlan {
  label: string;
  priceMonthly: number | null;
  maxAgents: number | null;
  monthlyRequests: number | null;
  retentionDays: number;
  features: Record<FeatureKey, boolean>;
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
  BUSINESS: buildPlan("BUSINESS"),
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
    features: raw.features,
  };
}

export type PlanType = keyof typeof PLAN_LIMITS;

/**
 * Tier names that no longer exist but may still be stored on an Organization or
 * carried in old Stripe subscription metadata.
 *
 * PRO was renamed to BUSINESS at the same limits. Mapping it here rather than
 * letting it fall through to FREE matters: an unknown tier silently downgrades a
 * paying customer to 2 agents and would start rejecting their traffic. The data
 * migration rewrites the stored rows, but Stripe objects created before the
 * rename keep the old name forever, so the alias stays.
 */
const LEGACY_TIER_ALIASES: Record<string, PlanType> = { PRO: "BUSINESS" };

/**
 * Tiers a customer can buy without talking to anyone.
 *
 * FREE is not a purchase and ENTERPRISE is quote-based, so both are excluded.
 * Derived from plans.json rather than typed out, because this list is consulted
 * in three places that must agree — the checkout route, the signup redirect, and
 * the billing page. When they disagreed, the pricing page happily sent people to
 * a plan the checkout then refused to sell them.
 */
export const PURCHASABLE_TIERS: PlanType[] = (
  Object.keys(PLAN_LIMITS) as PlanType[]
).filter((tier) => {
  const price = PLAN_LIMITS[tier].priceMonthly;
  return typeof price === "number" && price > 0;
});

/**
 * True when `tier` (any casing) is a self-serve paid plan. Goes through
 * normalizeTier so a stale `?plan=pro` link from before the rename still lands
 * the customer on Business checkout rather than silently on the dashboard.
 */
export function isPurchasableTier(tier?: string | null): boolean {
  return PURCHASABLE_TIERS.includes(normalizeTier(tier));
}

/**
 * True when a strictly more expensive self-serve plan exists. Compares prices
 * rather than positions, so reordering plans.json cannot silently offer someone
 * a downgrade labelled "Upgrade". Enterprise is quote-based and has no price,
 * so it never reports an upgrade — that conversation goes through sales.
 */
export function hasUpgradeAvailable(tier?: string | null): boolean {
  const current = PLAN_LIMITS[normalizeTier(tier)].priceMonthly;
  if (current === null) return false;
  return PURCHASABLE_TIERS.some((candidate) => {
    const price = PLAN_LIMITS[candidate].priceMonthly;
    return price !== null && price > current;
  });
}

/** Normalize an arbitrary (possibly null/unknown) tier string to a PlanType. */
export function normalizeTier(tier?: string | null): PlanType {
  const key = (tier ?? "FREE").toUpperCase();
  if (key in PLAN_LIMITS) return key as PlanType;
  return LEGACY_TIER_ALIASES[key] ?? "FREE";
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
 * True if `plan` includes `feature`.
 *
 * This is the authoritative check. The UI hides gated controls for tidiness, but
 * hiding a button stops nobody from calling the route directly — every gated
 * handler re-checks with requireFeature() in lib/server/guard.
 */
export function hasFeature(
  plan: PlanType | string | null | undefined,
  feature: FeatureKey,
): boolean {
  return PLAN_LIMITS[normalizeTier(plan)].features[feature] === true;
}

/**
 * The lowest-priced plan that includes `feature`, or null if no plan does.
 *
 * Used to tell a blocked caller *which* plan unlocks what they tried to use,
 * rather than a bare "upgrade required" that leaves them guessing. Returns null
 * for capabilities that are not built yet, so an upsell is never shown for
 * something we cannot actually deliver.
 */
export function lowestPlanWithFeature(feature: FeatureKey): PlanType | null {
  const order: PlanType[] = ["FREE", "STARTER", "GROWTH", "BUSINESS", "ENTERPRISE"];
  return order.find((tier) => PLAN_LIMITS[tier].features[feature]) ?? null;
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
    /**
     * Formatted monthly price, or null for quote-based tiers. The locale is
     * pinned because this string is rendered on the server: letting it follow
     * the machine's locale would give the client different digits to hydrate.
     */
    price:
      plan.priceMonthly === null
        ? null
        : `$${plan.priceMonthly.toLocaleString("en-US")}`,
  };
}

/**
 * Stripe price IDs, read from the environment at call time.
 *
 * Both naming schemes are accepted: STRIPE_PRICE_<TIER> is the current
 * convention, STRIPE_<TIER>_PRICE_ID the original one. Production still has the
 * old names set, and silently returning undefined for a configured plan turns
 * checkout into "Plan GROWTH is not configured for purchase" — so the old names
 * keep working until they are migrated. BUSINESS also falls back to the PRO
 * variables, since the Stripe price object survived the tier rename.
 *
 * Read per call rather than captured at module load: Next.js evaluates this
 * module during the build, where the runtime's env is not yet present.
 */
const PRICE_ENV_NAMES: Record<Exclude<PlanType, "FREE">, readonly string[]> = {
  STARTER: ["STRIPE_PRICE_STARTER", "STRIPE_STARTER_PRICE_ID"],
  GROWTH: ["STRIPE_PRICE_GROWTH", "STRIPE_GROWTH_PRICE_ID"],
  BUSINESS: ["STRIPE_PRICE_BUSINESS", "STRIPE_BUSINESS_PRICE_ID", "STRIPE_PRO_PRICE_ID"],
  ENTERPRISE: ["STRIPE_PRICE_ENTERPRISE", "STRIPE_ENTERPRISE_PRICE_ID"],
};

/** Map a plan tier to its configured Stripe price ID (from env), if any. */
export function priceIdForTier(tier: PlanType): string | undefined {
  const names = PRICE_ENV_NAMES[tier as Exclude<PlanType, "FREE">];
  if (!names) return undefined;
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

/** Map a Stripe price ID (from env) back to a plan tier. */
export function planForPriceId(priceId?: string | null): PlanType {
  if (!priceId) return "FREE";
  for (const tier of ["STARTER", "GROWTH", "BUSINESS", "ENTERPRISE"] as const) {
    if (PRICE_ENV_NAMES[tier].some((name) => process.env[name] === priceId)) {
      return tier;
    }
  }
  return "FREE";
}
