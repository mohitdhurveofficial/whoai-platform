# WHOAI Deployment Guide

## Architecture
- **Frontend**: Next.js 16 → Vercel
- **Backend**: FastAPI → Render
- **Database**: Supabase PostgreSQL (shared by both)

---

## 1. Vercel (Next.js Frontend)

### Prerequisites
- Vercel account
- Project connected to GitHub repo

### Environment Variables (Vercel)
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
# Database (use Supabase pooled URL for serverless)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Secrets
generate: openssl rand -hex 32
NEXTAUTH_SECRET=...
GATEWAY_SECRET=... (must be SAME as Render backend)
ENCRYPTION_KEY=... (64 hex chars, must be SAME as Render backend)
CRON_SECRET=...

# App URLs
NEXT_PUBLIC_APP_URL=https://whoai-dashboard.vercel.app
NEXT_PUBLIC_GATEWAY_URL=https://whoai-api.onrender.com/api/v1/chat/completions
CORS_ALLOW_ORIGINS=https://whoai-dashboard.vercel.app

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Crypto / Teardown checkout (used in app/checkout/page.tsx)
NEXT_PUBLIC_RECEIVING_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...

# Email
RESEND_API_KEY=re_...
SALES_EMAIL=founders@whoai.ai
```

### Build Command
Vercel auto-detects, but set this explicitly:
```
prisma generate && node node_modules/next/dist/bin/next build
```

### Stripe Webhook Setup
1. In the Stripe Dashboard, go to Developers → Webhooks → Add endpoint.
2. Endpoint URL: `https://whoai-platform.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy the Webhook signing secret (`whsec_...`) into Vercel as `STRIPE_WEBHOOK_SECRET`.
5. The handler is already implemented at `app/api/webhooks/stripe/route.ts` and uses `STRIPE_SECRET_KEY` plus `STRIPE_WEBHOOK_SECRET` for signature verification.

### Deploy
```bash
# If using Vercel CLI
vercel --prod
```

---

## 2. Render (FastAPI Backend)

The `render.yaml` is already configured. Just:

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml`
5. Add environment variables in Render dashboard:

```
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[HOST]:5432/postgres
GATEWAY_SECRET=... (same as Vercel)
ENCRYPTION_KEY=... (same as Vercel)
CORS_ALLOW_ORIGINS=https://whoai-dashboard.vercel.app
```

### Deploy
Render auto-deploys on git push.

---

## 3. Post-Deploy Checklist

- [ ] Signup works at `https://your-vercel-url.com/auth/signup`
- [ ] Dashboard loads with data
- [ ] Create agent + get API key
- [ ] Exchange key for JWT at `/api/v1/auth/token`
- [ ] Send test request through gateway
- [ ] Stripe checkout works
- [ ] Stripe webhook events are received and update the subscription tier
- [ ] Budget reset cron runs (Vercel Cron via `vercel.json`)

---

## Important Notes

### PgBouncer Compatibility
The dashboard and analytics services now run Prisma queries **sequentially** (not `Promise.all`) to avoid deadlocking on `connection_limit=1` with PgBouncer. This was fixed across:
- `lib/analytics/service.ts`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/usage/page.tsx`
- `app/api/dashboard/summary/route.ts`
- `lib/services/PolicyEngine.ts`

### CORS for Preview Deployments
If you use Vercel preview branches, add `*.vercel.app` (or the specific preview URL) to `CORS_ALLOW_ORIGINS` on the Render backend so preview deployments can call the FastAPI gateway. For production, keep it locked to the production frontend URL only.

### Shared Secrets
`GATEWAY_SECRET` and `ENCRYPTION_KEY` must be identical on Vercel and Render, or:
- Gateway tokens won't validate
- BYOK provider keys won't decrypt

### Database Migrations
```bash
# Run locally against production DB
npx prisma migrate deploy
```

### Demo Data
```bash
# After first deploy, seed demo data
npm run seed
```
