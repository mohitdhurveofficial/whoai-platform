import { describe, it, expect, beforeEach } from "vitest";
import {
  canCreateAgent,
  normalizeTier,
  planConfig,
  planForPriceId,
  priceIdForTier,
} from "@/lib/subscription";

describe("canCreateAgent", () => {
  it("enforces the Startup limit (5)", () => {
    expect(canCreateAgent(4, "STARTUP")).toBe(true);
    expect(canCreateAgent(5, "STARTUP")).toBe(false);
  });

  it("enforces the Growth limit (25)", () => {
    expect(canCreateAgent(24, "GROWTH")).toBe(true);
    expect(canCreateAgent(25, "GROWTH")).toBe(false);
  });

  it("enforces the Free limit (1)", () => {
    expect(canCreateAgent(0, "FREE")).toBe(true);
    expect(canCreateAgent(1, "FREE")).toBe(false);
  });

  it("treats unknown/empty tiers as Free", () => {
    expect(canCreateAgent(0, null)).toBe(true);
    expect(canCreateAgent(1, "bogus")).toBe(false);
    expect(canCreateAgent(1, undefined)).toBe(false);
  });
});

describe("normalizeTier", () => {
  it("uppercases and falls back to FREE", () => {
    expect(normalizeTier("startup")).toBe("STARTUP");
    expect(normalizeTier("nope")).toBe("FREE");
    expect(normalizeTier(null)).toBe("FREE");
  });
});

describe("planConfig", () => {
  it("returns label + limit", () => {
    expect(planConfig("GROWTH")).toMatchObject({ label: "Growth", maxAgents: 25 });
  });
});

describe("price <-> tier mapping", () => {
  beforeEach(() => {
    process.env.STRIPE_STARTUP_PRICE_ID = "price_startup";
    process.env.STRIPE_GROWTH_PRICE_ID = "price_growth";
    process.env.STRIPE_ENTERPRISE_PRICE_ID = "price_ent";
  });

  it("maps price id to tier", () => {
    expect(planForPriceId("price_startup")).toBe("STARTUP");
    expect(planForPriceId("price_growth")).toBe("GROWTH");
    expect(planForPriceId("price_ent")).toBe("ENTERPRISE");
    expect(planForPriceId("unknown")).toBe("FREE");
    expect(planForPriceId(null)).toBe("FREE");
  });

  it("maps tier to price id", () => {
    expect(priceIdForTier("STARTUP")).toBe("price_startup");
    expect(priceIdForTier("GROWTH")).toBe("price_growth");
    expect(priceIdForTier("FREE")).toBeUndefined();
  });
});
