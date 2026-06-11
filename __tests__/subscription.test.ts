import { describe, it, expect, beforeEach } from "vitest";
import {
  canCreateAgent,
  normalizeTier,
  planConfig,
  planForPriceId,
  priceIdForTier,
} from "@/lib/subscription";

describe("canCreateAgent", () => {
  it("enforces the Starter limit (10)", () => {
    expect(canCreateAgent(9, "STARTUP")).toBe(true);
    expect(canCreateAgent(10, "STARTUP")).toBe(false);
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
    expect(normalizeTier("startup")).toBe("STARTUP");
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

describe("price <-> tier mapping", () => {
  beforeEach(() => {
    process.env.STRIPE_STARTUP_PRICE_ID = "price_startup";
    process.env.STRIPE_GROWTH_PRICE_ID = "price_growth";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.STRIPE_ENTERPRISE_PRICE_ID = "price_ent";
  });

  it("maps price id to tier", () => {
    expect(planForPriceId("price_startup")).toBe("STARTUP");
    expect(planForPriceId("price_growth")).toBe("GROWTH");
    expect(planForPriceId("price_pro")).toBe("PRO");
    expect(planForPriceId("price_ent")).toBe("ENTERPRISE");
    expect(planForPriceId("unknown")).toBe("FREE");
    expect(planForPriceId(null)).toBe("FREE");
  });

  it("maps tier to price id", () => {
    expect(priceIdForTier("STARTUP")).toBe("price_startup");
    expect(priceIdForTier("GROWTH")).toBe("price_growth");
    expect(priceIdForTier("PRO")).toBe("price_pro");
    expect(priceIdForTier("FREE")).toBeUndefined();
  });
});
