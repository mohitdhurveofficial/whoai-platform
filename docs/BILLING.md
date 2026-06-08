# WHOAI Billing (Stripe)

End-to-end Stripe subscription billing: a user signs up, subscribes, manages
billing, and becomes a paying customer. The plan tier and status are synced onto
the `Organization` record and enforced across the platform.

## Architecture

```
Billing page  ─POST /api/billing/create-checkout─▶  Stripe Checkout ─▶ payment
   (UI)        ─POST /api/billing/create-portal──▶  Stripe Billing Portal
   (UI)        ─GET  /api/billing/subscription───▶  org plan + usage

Stripe ──webhook──▶ POST /api/webhooks/stripe ──▶ handleStripeEvent() ──▶ Organization
```

- **Control plane (Next.js)** owns billing. All routes are org-scoped via
  `getServerAuthContext()`.
- **Source of truth:** `Organization.subscriptionTier`, `subscriptionStatus`,
  `stripeCustomerId`, `stripeSubscriptionId`, `currentPeriodEnd`. No schema
  migration was required.
- **Enforcement:** `lib/subscription.ts` defines plan limits; agent creation
  rejects past the limit (HTTP 402, `PLAN_LIMIT_REACHED`).

## Plans

| Tier       | Price (ref) | Max agents |
|------------|-------------|------------|
| FREE       | $0          | 1          |
| STARTUP    | $2,000/mo   | 5          |
| GROWTH     | $5,000/mo   | 25         |
| ENTERPRISE | Custom      | 1000 (effectively unlimited) |

Limits live in `lib/subscription.ts` (`PLAN_LIMITS`). Prices/refs are display-only
in the UI; the billable amount is whatever the Stripe Price is configured for.

## Required environment variables

```
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...          # from `stripe listen` or the dashboard
STRIPE_STARTUP_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...     # optional
NEXT_PUBLIC_APP_URL=https://app.whoai... # used for success/cancel/return URLs
```

Create one recurring Stripe **Price** per paid tier and put its ID in the matching
env var. The checkout route resolves the price **server-side from the tier**, so a
client can never check out an arbitrary price.

## Webhook setup

1. Point a Stripe webhook at `POST /api/webhooks/stripe`.
2. Subscribe to: `checkout.session.completed`,
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`.
3. Put the signing secret in `STRIPE_WEBHOOK_SECRET`.

Local testing:

```
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

The route verifies the signature against the **raw** request body
(`constructEventAsync`) and returns 500 on handler errors so Stripe retries.
`current_period_end` is read from the **subscription item** (Stripe API
`2026-05-27.dahlia`).

## Multi-tenant isolation

- Checkout stamps `organizationId` into the Checkout Session and Subscription
  metadata.
- The webhook matches orgs by that `organizationId` or by `stripeCustomerId`
  (unique per org), so an event can only ever mutate its own organization.
- Every billing API derives `organizationId` from the session, never the client.

## Tests

- `npm run test:unit` (vitest): `lib/subscription` limits/mapping and
  `handleStripeEvent` event→DB sync (mocked Prisma) — 14 tests.
- Stripe API/network paths (checkout/portal creation, signature verification) are
  exercised manually against Stripe test mode.
