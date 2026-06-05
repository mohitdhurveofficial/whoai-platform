export type BillingTier = "FREE" | "STARTUP" | "GROWTH";

export type BillingPlan = {
  tier: BillingTier;
  name: string;
  monthlyCost: number;
  maxAgents: number;
  monthlyRequests: number;
  features: string[];
  stripePriceEnv?: string;
};

export const BILLING_PLANS: Record<BillingTier, BillingPlan> = {
  FREE: {
    tier: "FREE",
    name: "Free",
    monthlyCost: 0,
    maxAgents: 1,
    monthlyRequests: 5_000,
    features: ["1 Agent", "5,000 requests/month", "Basic visibility"],
  },
  STARTUP: {
    tier: "STARTUP",
    name: "Startup",
    monthlyCost: 49,
    maxAgents: 5,
    monthlyRequests: 100_000,
    features: ["5 Agents", "100,000 requests/month", "Basic Analytics"],
    stripePriceEnv: "STRIPE_STARTUP_PRICE_ID",
  },
  GROWTH: {
    tier: "GROWTH",
    name: "Growth",
    monthlyCost: 199,
    maxAgents: 25,
    monthlyRequests: 1_000_000,
    features: ["25 Agents", "1M requests/month", "Advanced Analytics", "Priority Support"],
    stripePriceEnv: "STRIPE_GROWTH_PRICE_ID",
  },
};

export function normalizeTier(value?: string | null): BillingTier {
  if (value === "STARTUP" || value === "GROWTH") return value;
  return "FREE";
}

export function getPlan(value?: string | null) {
  return BILLING_PLANS[normalizeTier(value)];
}
