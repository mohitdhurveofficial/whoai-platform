# WHOAI Auth & Billing Integration

This document covers the Phase 7 implementation of organization-scoped authentication and Stripe-powered billing.

## 1. Authentication & Route Protection

WHOAI uses **Supabase Auth** with `@supabase/ssr` for server-side session management.

### Protected Routes
The following paths are protected by `middleware.ts`. Unauthenticated requests are redirected to `/login`.
- `/dashboard`
- `/agents`
- `/usage`
- `/billing`
- `/settings`

## 2. Multi-Tenancy

Every user belongs to an `Organization`. All database queries are strictly filtered by `organizationId`.
- Billing settings are managed at the Organization level.
- Agent limits are enforced per Organization.

## 3. Subscription Plans

| Plan | Price | Agent Limit | Features |
| :--- | :--- | :--- | :--- |
| **Free** | $0 | 1 | Basic tracking |
| **Startup** | $2,000/mo | 5 | Alerts, Full History |
| **Growth** | $5,000/mo | 25 | Kill Switch, Anomaly Detection |
| **Enterprise** | Custom | Custom | VPC Support, SSO |

## 4. Stripe Integration

### APIs
- `POST /api/billing/create-checkout`: Generates a Stripe Checkout URL for upgrades.
- `POST /api/billing/create-portal`: Generates a Stripe Customer Portal URL for subscription management.
- `GET /api/billing/subscription`: Fetches current plan status and renewal dates.

### Webhooks
The `POST /api/webhooks/stripe` endpoint handles:
- `checkout.session.completed`: Links Stripe Customer to Organization.
- `customer.subscription.updated`: Syncs plan changes and status.
- `customer.subscription.deleted`: Reverts Organization to Free tier.
- `invoice.payment_failed`: Marks subscription as `past_due`.

## 5. Development

To test webhooks locally, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Ensure `STRIPE_WEBHOOK_SECRET` is set in your `.env`.