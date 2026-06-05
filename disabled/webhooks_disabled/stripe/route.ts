import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.metadata?.organizationId) {
        await prisma.organization.update({
          where: { id: checkoutSession.metadata.organizationId },
          data: {
            stripeCustomerId: checkoutSession.customer as string,
          },
        });
      }
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0].price.id;
      
      // Map Price ID to Plan Name
      let planName = 'FREE';
      if (priceId === process.env.STRIPE_STARTUP_PRICE_ID) planName = 'STARTUP';
      if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) planName = 'GROWTH';

      await prisma.organization.update({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          subscriptionStatus: subscription.status,
          stripePriceId: priceId,
          plan: planName as any,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;

    case 'customer.subscription.deleted':
      await prisma.organization.update({
        where: { stripeCustomerId: (event.data.object as any).customer as string },
        data: {
          subscriptionStatus: 'canceled',
          plan: 'FREE',
          stripePriceId: null,
        },
      });
      break;

    case 'invoice.paid':
      // Optional: Log payment success
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      await prisma.organization.update({
        where: { stripeCustomerId: failedInvoice.customer as string },
        data: {
          subscriptionStatus: 'past_due',
        },
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};