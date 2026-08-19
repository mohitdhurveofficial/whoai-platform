import { describe, it, expect, beforeEach } from "vitest";
import {
  canCreateAgent,
  hasFeature,
  lowestPlanWithFeature,
  monthlyRequestQuota,
  normalizeTier,
  planConfig,
  planForPriceId,
  planLimitsCopy,
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

  it("enforces the Business limit (200)", () => {
    expect(canCreateAgent(199, "BUSINESS")).toBe(true);
    expect(canCreateAgent(200, "BUSINESS")).toBe(false);
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
    expect(normalizeTier("business")).toBe("BUSINESS");
    expect(normalizeTier("nope")).toBe("FREE");
    expect(normalizeTier(null)).toBe("FREE");
  });

  // Rows written before the rename still say PRO. Falling through to FREE would
  // silently downgrade a paying customer to 2 agents, so the alias is enforced,
  // not cosmetic — the data migration and this alias have to agree.
  it("maps the legacy PRO tier onto BUSINESS rather than FREE", () => {
    expect(normalizeTier("PRO")).toBe("BUSINESS");
    expect(normalizeTier("pro")).toBe("BUSINESS");
    expect(canCreateAgent(199, "PRO")).toBe(true);
    expect(monthlyRequestQuota("PRO")).toBe(monthlyRequestQuota("BUSINESS"));
  });
});

describe("planConfig", () => {
  it("returns label + limit", () => {
    expect(planConfig("GROWTH")).toMatchObject({ label: "Growth", maxAgents: 50 });
    expect(planConfig("BUSINESS")).toMatchObject({ label: "Business", maxAgents: 200 });
  });
});

describe("feature entitlements", () => {
  it("gives Free none of the paid capabilities", () => {
    expect(hasFeature("FREE", "budgetEnforcement")).toBe(false);
    expect(hasFeature("FREE", "killSwitch")).toBe(false);
    expect(hasFeature(null, "anomalyDetection")).toBe(false);
  });

  it("starts enforcement at Starter and analytics at Growth", () => {
    expect(hasFeature("STARTER", "budgetEnforcement")).toBe(true);
    expect(hasFeature("STARTER", "killSwitch")).toBe(true);
    // The pricing page sells anomaly detection as a Growth capability; if this
    // flips, the page is advertising something Starter would be denied at 402.
    expect(hasFeature("STARTER", "anomalyDetection")).toBe(false);
    expect(hasFeature("GROWTH", "anomalyDetection")).toBe(true);
    expect(hasFeature("GROWTH", "advancedAnalytics")).toBe(true);
  });

  it("is monotonic — no capability is lost by paying more", () => {
    const order: Array<Parameters<typeof hasFeature>[0]> = [
      "FREE",
      "STARTER",
      "GROWTH",
      "BUSINESS",
      "ENTERPRISE",
    ];
    const features = Object.keys(plansData.plans.FREE.features) as Array<
      Parameters<typeof hasFeature>[1]
    >;

    for (const feature of features) {
      let seenTrue = false;
      for (const tier of order) {
        const on = hasFeature(tier, feature);
        if (on) seenTrue = true;
        else expect([feature, tier, seenTrue]).toEqual([feature, tier, false]);
      }
    }
  });

  it("does not claim features that are not built", () => {
    // plans.json documents these as unimplemented. Turning one on here without
    // building it would put a promise in a paid plan we cannot keep.
    for (const tier of ["FREE", "STARTER", "GROWTH", "BUSINESS", "ENTERPRISE"] as const) {
      expect(hasFeature(tier, "sso")).toBe(false);
      expect(hasFeature(tier, "auditExport")).toBe(false);
    }
  });

  it("names the cheapest plan that includes a feature, for the upgrade prompt", () => {
    expect(lowestPlanWithFeature("budgetEnforcement")).toBe("STARTER");
    expect(lowestPlanWithFeature("anomalyDetection")).toBe("GROWTH");
    // null means "nothing ships it" — the UI says coming soon instead of
    // selling an upgrade that would not deliver the feature.
    expect(lowestPlanWithFeature("sso")).toBeNull();
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
  const PRICE_VARS = [
    "STRIPE_PRICE_STARTER",
    "STRIPE_PRICE_GROWTH",
    "STRIPE_PRICE_BUSINESS",
    "STRIPE_PRICE_ENTERPRISE",
    "STRIPE_STARTER_PRICE_ID",
    "STRIPE_GROWTH_PRICE_ID",
    "STRIPE_BUSINESS_PRICE_ID",
    "STRIPE_PRO_PRICE_ID",
    "STRIPE_ENTERPRISE_PRICE_ID",
  ];

  beforeEach(() => {
    // Cleared first: these are read per call, so a leftover legacy name from a
    // previous test would mask a broken lookup of the canonical one.
    for (const name of PRICE_VARS) delete process.env[name];
    process.env.STRIPE_PRICE_STARTER = "price_starter";
    process.env.STRIPE_PRICE_GROWTH = "price_growth";
    process.env.STRIPE_PRICE_BUSINESS = "price_business";
    process.env.STRIPE_PRICE_ENTERPRISE = "price_ent";
  });

  it("maps price id to tier", () => {
    expect(planForPriceId("price_starter")).toBe("STARTER");
    expect(planForPriceId("price_growth")).toBe("GROWTH");
    expect(planForPriceId("price_business")).toBe("BUSINESS");
    expect(planForPriceId("price_ent")).toBe("ENTERPRISE");
    expect(planForPriceId("unknown")).toBe("FREE");
    expect(planForPriceId(null)).toBe("FREE");
  });

  it("maps tier to price id", () => {
    expect(priceIdForTier("STARTER")).toBe("price_starter");
    expect(priceIdForTier("GROWTH")).toBe("price_growth");
    expect(priceIdForTier("BUSINESS")).toBe("price_business");
    expect(priceIdForTier("FREE")).toBeUndefined();
  });

  // Production still has the pre-rename variable names set. Dropping support
  // for them would break checkout and, worse, make live webhooks resolve every
  // paid subscription to FREE.
  it("still honours the legacy env var names", () => {
    for (const name of PRICE_VARS) delete process.env[name];
    process.env.STRIPE_STARTER_PRICE_ID = "legacy_starter";
    process.env.STRIPE_PRO_PRICE_ID = "legacy_pro";

    expect(priceIdForTier("STARTER")).toBe("legacy_starter");
    expect(priceIdForTier("BUSINESS")).toBe("legacy_pro");
    expect(planForPriceId("legacy_pro")).toBe("BUSINESS");
  });

  it("prefers the canonical name when both are set", () => {
    process.env.STRIPE_BUSINESS_PRICE_ID = "legacy_business";
    expect(priceIdForTier("BUSINESS")).toBe("price_business");
  });
});

describe("planLimitsCopy", () => {
  it("derives the marketing copy from plans.json rather than restating it", () => {
    const free = planLimitsCopy("FREE");
    const raw = plansData.plans.FREE;

    expect(free.agents).toBe(`${raw.maxAgents} agents`);
    expect(free.retention).toBe(`${raw.retentionDays}-day data retention`);
    expect(free.price).toBe(`$${raw.priceMonthly}`);
  });

  it("abbreviates request allowances the way a pricing page writes them", () => {
    expect(planLimitsCopy("FREE").requests).toBe("50k requests / mo");
    expect(planLimitsCopy("STARTER").requests).toBe("1M requests / mo");
    expect(planLimitsCopy("GROWTH").requests).toBe("5M requests / mo");
    expect(planLimitsCopy("BUSINESS").requests).toBe("20M requests / mo");
  });

  it("says unlimited instead of Infinity on quote-based tiers", () => {
    const enterprise = planLimitsCopy("ENTERPRISE");

    expect(enterprise.agents).toBe("Unlimited agents");
    expect(enterprise.requests).toBe("Unmetered requests");
    // null, not "$null" — the caller decides whether to print "Custom".
    expect(enterprise.price).toBeNull();
  });

  it("falls back to Free for an unknown tier, matching enforcement", () => {
    expect(planLimitsCopy("nonsense").allowance).toBe(planLimitsCopy("FREE").allowance);
  });
});
