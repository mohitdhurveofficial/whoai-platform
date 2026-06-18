import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getServerAuthContext } from "@/lib/server/auth";
import { priceIdForTier, type PlanType } from "@/lib/subscription";

// Self-serve checkout is Starter/Growth/Pro only. Enterprise is sales-led
// (the UI routes it to "Contact sales"), so it is intentionally excluded here.
const PURCHASABLE_TIERS: PlanType[] = ["STARTER", "GROWTH", "PRO"];

export async function POST(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { tier?: string };
    const tier = (body.tier ?? "").toUpperCase() as PlanType;

    // Enterprise is sales-led, not self-serve — keep the API consistent with
    // the UI so a stray Enterprise call gets a clear, correct response.
    if (tier === "ENTERPRISE") {
      return NextResponse.json(
        { error: "Enterprise plans are sales-led — please contact sales.", contactSales: true },
        { status: 400 },
      );
    }

    if (!PURCHASABLE_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: "A valid plan tier is required" },
        { status: 400 },
      );
    }

    // Resolve the price server-side so a client can never check out an
    // arbitrary Stripe price.
    const priceId = priceIdForTier(tier);
    if (!priceId) {
      return NextResponse.json(
        { error: `Plan ${tier} is not configured for purchase` },
        { status: 400 },
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
      },
    });
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const user = auth.userId
      ? await prisma.user.findUnique({
          where: { id: auth.userId },
          select: { email: true },
        })
      : null;

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    // If the organization already has a live subscription, change the plan in
    // place (with proration) instead of creating a second subscription — that
    // double-bills the customer. This is the upgrade/downgrade path.
    const LIVE_STATUSES = new Set(["active", "trialing", "past_due"]);
    if (
      organization.stripeSubscriptionId &&
      LIVE_STATUSES.has((organization.subscriptionStatus ?? "").toLowerCase())
    ) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          organization.stripeSubscriptionId,
        );
        const currentItem = subscription.items.data[0];

        if (currentItem?.price?.id === priceId) {
          return NextResponse.json(
            { error: "You are already on this plan." },
            { status: 400 },
          );
        }

        await stripe.subscriptions.update(organization.stripeSubscriptionId, {
          items: [{ id: currentItem.id, price: priceId }],
          // Charge/credit the difference immediately for a fair upgrade/downgrade.
          proration_behavior: "create_prorations",
          // Surface card failures on an upgrade synchronously instead of leaving
          // the subscription in an incomplete state.
          payment_behavior: "error_if_incomplete",
        });

        // customer.subscription.updated will sync the new tier via the webhook.
        return NextResponse.json({ url: `${appUrl}/billing?success=true` });
      } catch (error) {
        // Stripe card errors carry a customer-safe message (e.g. "card declined").
        const isCardError =
          typeof error === "object" &&
          error !== null &&
          (error as { type?: string }).type === "StripeCardError";
        return NextResponse.json(
          {
            error: isCardError
              ? (error as { message?: string }).message ?? "Your card was declined."
              : "Could not change plan. Please try again or use Manage Billing.",
          },
          { status: isCardError ? 402 : 500 },
        );
      }
    }

    // New subscriber: create-or-reuse a Stripe customer bound to this org.
    let customerId = organization.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: organization.name,
        email: user?.email ?? undefined,
        metadata: { organizationId: organization.id },
      });
      customerId = customer.id;
      await prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      // organizationId is the multi-tenant anchor the webhook syncs against.
      metadata: { organizationId: organization.id },
      subscription_data: {
        metadata: { organizationId: organization.id },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
