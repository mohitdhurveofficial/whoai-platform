import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { requirePermission } from "@/lib/server/guard";

/**
 * Schedule — or call off — the cancellation of the organization's subscription.
 *
 * Cancel at period end rather than immediately: the customer has already paid
 * through the current period, and revoking the plan the moment they click Cancel
 * takes away service they are owed. Stripe keeps the subscription `active` until
 * the period closes and then emits `customer.subscription.deleted`, which is what
 * actually drops the org to FREE (see lib/billing/stripe-sync.ts).
 *
 * The same route un-cancels, because a customer who changes their mind before the
 * period ends should not have to talk to anyone.
 */
export async function POST(req: Request) {
  const guard = await requirePermission("manageBilling");
  if (!guard.ok) return guard.response;
  const auth = guard.auth;

  const body = (await req.json().catch(() => ({}))) as { cancelAtPeriodEnd?: unknown };
  if (typeof body.cancelAtPeriodEnd !== "boolean") {
    return NextResponse.json(
      { error: "cancelAtPeriodEnd must be true or false" },
      { status: 400 },
    );
  }
  const cancelAtPeriodEnd = body.cancelAtPeriodEnd;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: { id: true, stripeSubscriptionId: true, subscriptionStatus: true },
    });
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Nothing to cancel on the free plan — say so plainly instead of throwing a
    // Stripe error the customer cannot act on.
    if (!organization.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "You are on the Free plan — there is no subscription to cancel." },
        { status: 400 },
      );
    }

    const subscription = await getStripe().subscriptions.update(
      organization.stripeSubscriptionId,
      { cancel_at_period_end: cancelAtPeriodEnd },
    );

    // Write through immediately. The webhook will send the same value moments
    // later, but the customer is about to be redirected back to a page that has
    // to show the new state now — waiting on Stripe's round trip reads as "the
    // button did nothing".
    await prisma.organization.update({
      where: { id: organization.id },
      data: { cancelAtPeriodEnd },
    });

    const item = subscription.items?.data?.[0] as { current_period_end?: number } | undefined;
    return NextResponse.json({
      cancelAtPeriodEnd,
      effectiveAt:
        typeof item?.current_period_end === "number"
          ? new Date(item.current_period_end * 1000).toISOString()
          : null,
    });
  } catch (error) {
    console.error("Stripe cancel error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: cancelAtPeriodEnd
          ? "Could not schedule cancellation. Please try again or use Manage Billing."
          : "Could not resume the subscription. Please try again or use Manage Billing.",
      },
      { status: 500 },
    );
  }
}
