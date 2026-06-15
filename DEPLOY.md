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

# Email
RESEND_API_KEY=re_...
SALES_EMAIL=founders@whoai.ai
```

### Build Command
Vercel auto-detects, but set this explicitly:
```
prisma generate && node node_modules/next/dist/bin/next build
```

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

- [ ] Signup works at `https://your-vercel-url.com/signup`
- [ ] Dashboard loads with data
- [ ] Create agent + get API key
- [ ] Exchange key for JWT at `/api/v1/auth/token`
- [ ] Send test request through gateway
- [ ] Stripe checkout works
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
