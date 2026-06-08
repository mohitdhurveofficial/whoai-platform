import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleStripeEvent, type SyncDb } from "@/lib/billing/stripe-sync";

function makeDb() {
  const update = vi.fn().mockResolvedValue({});
  const updateMany = vi.fn().mockResolvedValue({ count: 1 });
  const db: SyncDb = { organization: { update, updateMany } as never };
  return { db, update, updateMany };
}

beforeEach(() => {
  process.env.STRIPE_GROWTH_PRICE_ID = "price_growth";
  process.env.STRIPE_STARTUP_PRICE_ID = "price_startup";
});

describe("handleStripeEvent", () => {
  it("checkout.session.completed sets customer + subscription on the org", async () => {
    const { db, update } = makeDb();
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { organizationId: "org-1" },
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    } as never;

    const result = await handleStripeEvent(event, db);

    expect(result).toEqual({ type: "checkout.session.completed", handled: true });
    expect(update).toHaveBeenCalledWith({
      where: { id: "org-1" },
      data: { stripeCustomerId: "cus_123", stripeSubscriptionId: "sub_123" },
    });
  });

  it("ignores checkout.session.completed without organizationId", async () => {
    const { db, update } = makeDb();
    const event = {
      type: "checkout.session.completed",
      data: { object: { metadata: {}, customer: "cus_x" } },
    } as never;

    const result = await handleStripeEvent(event, db);

    expect(result.handled).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("customer.subscription.updated syncs tier/status/period by customer", async () => {
    const { db, updateMany } = makeDb();
    const event = {
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          items: {
            data: [{ price: { id: "price_growth" }, current_period_end: 1_900_000_000 }],
          },
        },
      },
    } as never;

    const result = await handleStripeEvent(event, db);

    expect(result.handled).toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_123" },
      data: {
        stripeSubscriptionId: "sub_123",
        subscriptionStatus: "active",
        subscriptionTier: "GROWTH",
        currentPeriodEnd: new Date(1_900_000_000 * 1000),
      },
    });
  });

  it("customer.subscription.deleted downgrades to FREE", async () => {
    const { db, updateMany } = makeDb();
    const event = {
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_123", customer: "cus_123", items: { data: [] } } },
    } as never;

    const result = await handleStripeEvent(event, db);

    expect(result.handled).toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_123" },
      data: {
        subscriptionStatus: "canceled",
        subscriptionTier: "FREE",
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      },
    });
  });

  it("invoice.payment_failed marks the org past_due", async () => {
    const { db, updateMany } = makeDb();
    const event = {
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_123" } },
    } as never;

    const result = await handleStripeEvent(event, db);

    expect(result.handled).toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_123" },
      data: { subscriptionStatus: "past_due" },
    });
  });

  it("returns handled:false for unrelated events", async () => {
    const { db, update, updateMany } = makeDb();
    const event = { type: "customer.created", data: { object: {} } } as never;

    const result = await handleStripeEvent(event, db);

    expect(result.handled).toBe(false);
    expect(update).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });
});
