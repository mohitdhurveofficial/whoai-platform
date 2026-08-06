import { describe, it, expect, beforeEach } from "vitest";
import {
  canCreateAgent,
  monthlyRequestQuota,
  normalizeTier,
  planConfig,
  planForPriceId,
  priceIdForTier,
  retentionDays,
} from "@/lib/subscription";
import plansData from "@/plans.json";

describe("canCreateAgent", () => {
  it("enforces the Starter limit (10)", () => {
    expect(canCreateAgent(9, "STARTER")).toBe(true);
    expect(canCreateAgent(10, "STARTER")).toBe(false);
  });

  it("enforces the Growth limit (50)", () => {
    expect(canCreateAgent(49, "GROWTH")).toBe(true);
    expect(canCreateAgent(50, "GROWTH")).toBe(false);
  });

  it("enforces the Pro limit (200)", () => {
    expect(canCreateAgent(199, "PRO")).toBe(true);
    expect(canCreateAgent(200, "PRO")).toBe(false);
  });

  it("never blocks on Enterprise (unlimited)", () => {
    expect(canCreateAgent(100_000, "ENTERPRISE")).toBe(true);
  });

  it("enforces the Free limit (2)", () => {
    expect(canCreateAgent(1, "FREE")).toBe(true);
    expect(canCreateAgent(2, "FREE")).toBe(false);
  });

  it("treats unknown/empty tiers as Free", () => {
    expect(canCreateAgent(0, null)).toBe(true);
    expect(canCreateAgent(2, "bogus")).toBe(false);
    expect(canCreateAgent(2, undefined)).toBe(false);
  });
});

describe("normalizeTier", () => {
  it("uppercases and falls back to FREE", () => {
    expect(normalizeTier("starter")).toBe("STARTER");
    expect(normalizeTier("pro")).toBe("PRO");
    expect(normalizeTier("nope")).toBe("FREE");
    expect(normalizeTier(null)).toBe("FREE");
  });
});

describe("planConfig", () => {
  it("returns label + limit", () => {
    expect(planConfig("GROWTH")).toMatchObject({ label: "Growth", maxAgents: 50 });
    expect(planConfig("PRO")).toMatchObject({ label: "Pro", maxAgents: 200 });
  });
});

describe("plans.json is the single source of truth", () => {
  // The Python runtime enforces the request quota by reading the same file
  // (runtime/entitlements/plans.py). If these ever came from a hand-copied
  // table, a customer could be blocked at a limit they were never sold.
  const raw = (plansData as { plans: Record<string, { monthlyRequests: number | null; retentionDays: number; maxAgents: number | null }> }).plans;

  it("derives every enforced limit from the file", () => {
    for (const [tier, limits] of Object.entries(raw)) {
      expect(monthlyRequestQuota(tier)).toBe(limits.monthlyRequests);
      expect(retentionDays(tier)).toBe(limits.retentionDays);
    }
  });

  it("reports unlimited as null, not as a number a UI would render", () => {
    expect(monthlyRequestQuota("ENTERPRISE")).toBeNull();
    expect(planConfig("ENTERPRISE").monthlyRequests).toBe(Infinity);
  });

  it("falls back to the most restrictive plan for unknown tiers", () => {
    expect(monthlyRequestQuota("bogus")).toBe(raw.FREE.monthlyRequests);
    expect(retentionDays(null)).toBe(raw.FREE.retentionDays);
  });
});

describe("price <-> tier mapping", () => {
  beforeEach(() => {
    process.env.STRIPE_STARTER_PRICE_ID = "price_startup";
    process.env.STRIPE_GROWTH_PRICE_ID = "price_growth";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.STRIPE_ENTERPRISE_PRICE_ID = "price_ent";
  });

  it("maps price id to tier", () => {
    expect(planForPriceId("price_startup")).toBe("STARTER");
    expect(planForPriceId("price_growth")).toBe("GROWTH");
    expect(planForPriceId("price_pro")).toBe("PRO");
    expect(planForPriceId("price_ent")).toBe("ENTERPRISE");
    expect(planForPriceId("unknown")).toBe("FREE");
    expect(planForPriceId(null)).toBe("FREE");
  });

  it("maps tier to price id", () => {
    expect(priceIdForTier("STARTER")).toBe("price_startup");
    expect(priceIdForTier("GROWTH")).toBe("price_growth");
    expect(priceIdForTier("PRO")).toBe("price_pro");
    expect(priceIdForTier("FREE")).toBeUndefined();
  });
});
