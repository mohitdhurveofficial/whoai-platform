import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getServerAuthContext } from "@/lib/server/auth";
import { priceIdForTier, type PlanType } from "@/lib/subscription";

const PURCHASABLE_TIERS: PlanType[] = ["STARTUP", "GROWTH", "ENTERPRISE"];

export async function POST(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { tier?: string };
    const tier = (body.tier ?? "").toUpperCase() as PlanType;

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
      select: { id: true, name: true, stripeCustomerId: true },
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

    // Create-or-reuse a Stripe customer bound to this organization.
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

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
