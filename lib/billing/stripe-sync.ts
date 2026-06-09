import type Stripe from "stripe";
import type { PrismaClient } from "@prisma/client";
import { planForPriceId } from "@/lib/subscription";

// Minimal Prisma surface we need, so the handler is easy to unit-test with a mock.
type OrgWriter = Pick<PrismaClient["organization"], "update" | "updateMany">;
export interface SyncDb {
  organization: OrgWriter;
}

export interface SyncResult {
  type: string;
  handled: boolean;
}

function periodEndFrom(subscription: Stripe.Subscription): Date | null {
  // In Stripe API 2026-05-27+, current_period_end lives on the subscription item.
  const item = subscription.items?.data?.[0] as
    | { current_period_end?: number }
    | undefined;
  const ts = item?.current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000) : null;
}

/**
 * Apply a verified Stripe event to the Organization records. Pure aside from the
 * injected db, so it can be unit-tested without Stripe or a real database.
 *
 * Multi-tenant safety: organizations are matched either by the organizationId we
 * stamped into Stripe metadata, or by stripeCustomerId (unique per org). An event
 * can therefore only ever mutate the single organization it belongs to.
 */
export async function handleStripeEvent(
  event: Stripe.Event,
  db: SyncDb,
): Promise<SyncResult> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.metadata?.organizationId;
      if (!organizationId) return { type: event.type, handled: false };

      // updateMany (not update) so a replayed event for a since-deleted org is a
      // no-op rather than a P2025 throw that makes Stripe retry the event forever.
      await db.organization.updateMany({
        where: { id: organizationId },
        data: {
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : undefined,
        },
      });
      return { type: event.type, handled: true };
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;
      if (!customerId) return { type: event.type, handled: false };

      const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
      // Only grant the paid tier while the subscription is actually live. A
      // canceled/unpaid/incomplete "updated" event must drop entitlements to
      // FREE rather than leave the org on a plan it is no longer paying for.
      const LIVE_STATUSES = new Set(["active", "trialing", "past_due"]);
      const tier = LIVE_STATUSES.has(subscription.status)
        ? planForPriceId(priceId)
        : "FREE";

      await db.organization.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionTier: tier,
          currentPeriodEnd: periodEndFrom(subscription),
        },
      });
      return { type: event.type, handled: true };
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;
      if (!customerId) return { type: event.type, handled: false };

      await db.organization.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: "canceled",
          subscriptionTier: "FREE",
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        },
      });
      return { type: event.type, handled: true };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : null;
      if (!customerId) return { type: event.type, handled: false };

      await db.organization.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: "past_due" },
      });
      return { type: event.type, handled: true };
    }

    default:
      return { type: event.type, handled: false };
  }
}
