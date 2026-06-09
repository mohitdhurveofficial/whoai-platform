import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { handleStripeEvent } from "@/lib/billing/stripe-sync";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Billing not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Raw body is required for signature verification.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Idempotency: Stripe delivers at-least-once and can reorder retries. Record
  // each processed event.id; a duplicate is acknowledged without re-applying.
  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (err) {
    if (
      typeof err === "object" && err !== null && "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Stripe event dedupe error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Webhook dedupe failed" }, { status: 500 });
  }

  try {
    await handleStripeEvent(event, prisma);
  } catch (err) {
    console.error("Stripe webhook handling error:", err instanceof Error ? err.message : err);
    // Remove the dedupe marker so Stripe's retry is reprocessed rather than
    // skipped as a duplicate on a transient failure.
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => {});
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
