# WHOAI Platform — Production Readiness Audit

**Date:** 2026-06-08
**Auditor:** Lead Architect / CTO review
**Branch:** `backup-current`
**Scope:** Full repository — Next.js 16 app, FastAPI gateway, Prisma/Postgres data model, auth, billing, security, tests.

---

## 0. Executive Summary

WHOAI is **further along than a typical MVP-stage repo**, but it is **not launchable today**. The
single most important problem is that **the core product — the AI gateway — is unreachable by real
customers**: there is no endpoint that issues the gateway access token agents must present. An agent
can be created in the dashboard, but it can never make a billable request. Everything downstream
(spend logs, dashboards, kill switch) is well-built but is currently fed only by tests and demo data.

There is a strong, genuinely-implemented backend (multi-provider proxy, real pricing, kill switch,
budgets, telemetry, multi-tenant data model). The gaps are concentrated in **the seams**: token
issuance, BYOK wiring, billing (disabled), route protection, and operational hygiene (debug logging
of secrets/PII).

**Estimated completion toward a sellable MVP: ~58%.**

| Area | State | % |
|---|---|---|
| Data model (multi-tenant) | Strong, org-scoped | 90% |
| FastAPI gateway core (proxy, providers, streaming) | Strong, but unreachable | 80% |
| Telemetry (cost, spend, metrics, activity) | Strong | 85% |
| Kill switch + budgets | Strong, tested | 80% |
| Agent token issuance | **Missing** | 0% |
| BYOK (per-org provider keys) | Stored, **not wired** | 35% |
| Next.js API (agents, dashboard, settings) | Mostly real + org-scoped | 75% |
| Auth (signup/login/session) | Works (Supabase + JWT) | 75% |
| Dashboard UI | Real summary; partial screens | 60% |
| Alerts | Models + creation exist; UX partial | 50% |
| Billing / Stripe | Disabled | 5% |
| Security hardening | Multiple issues | 40% |
| Landing page / GTM | Unverified | 30% |

---

## 1. Architecture Overview

Two cooperating stacks share one Postgres (Supabase) database:

- **Next.js 16 App Router** (`app/`) — dashboard UI + control-plane API (`app/api/*`): auth, agent
  CRUD, dashboard summaries, settings/BYOK, api-keys, usage, budgets, alerts. Uses Prisma.
  > Note: this project pins **Next.js 16**, where middleware is `proxy.ts` (not `middleware.ts`).
  > Read `node_modules/next/dist/docs/` before changing framework-level files.
- **FastAPI gateway** (`runtime/`) — the data-plane LLM proxy at `/api/v1/chat/completions`.
  Authenticates agents via a JWT signed with `GATEWAY_SECRET`, enforces kill switch + budgets, calls
  providers (OpenAI/Anthropic/Gemini/Grok/DeepSeek), and writes spend/usage/activity telemetry via
  SQLAlchemy (`database/models.py`, `database/session.py`).
- **Auth**: passwords live in **Supabase Auth**; the Prisma `User` row holds role + `organizationId`.
  Login mints a 7-day JWT (`whoai_auth` httpOnly cookie) carrying `userId` + `organizationId`.

Multi-tenancy: tenant context comes from the JWT's `organizationId` (control plane) and the agent
JWT's `org` claim (data plane). The Prisma schema is consistently org-scoped with `@@index([organizationId, …])`.

---

## 2. Existing / Working Features

- **Multi-tenant data model** (`prisma/schema.prisma`): Organization, User, Agent, SpendLog,
  RequestLog, UsageMetrics, Alert, BudgetViolation, ActivityLog, ApiKey, ProviderCredential,
  Subscription, Policy. Org-scoped, indexed, with budget/spend counters on Org and Agent.
- **FastAPI unified gateway** (`runtime/routers/gateway.py`): one `/chat/completions` for all
  providers, provider+fallback routing, exponential-backoff retry, **real streaming** (SSE), kill-switch
  and budget gates, and full telemetry (spend log, daily metrics, activity log) per request.
- **Real provider integrations** (`runtime/providers/*`): OpenAI, Anthropic, Gemini, Grok, DeepSeek,
  plus `/providers/status` health checks.
- **Real cost calculation** (`runtime/telemetry/pricing.py`): per-model input/output pricing registry.
- **Kill switch + budget enforcement** (`runtime/killswitch`, `runtime/budget`): agent/org pause on
  budget breach, blocking of PAUSED agents/orgs — covered by passing unit tests.
- **Auth flow**: Supabase-backed signup/login, org auto-provisioned on signup, httpOnly JWT session,
  `getServerAuthContext()` helper (`lib/server/auth.ts`) used by control-plane routes.
- **Org-scoped control-plane API**: `app/api/agents` (CRUD + pause/resume/status), `app/api/dashboard/*`
  (summary, spend-by-agent/day/model), `app/api/api-keys`, `app/api/settings/providers` (BYOK store),
  `app/api/usage`, `app/api/budgets`, `app/api/alerts`, `app/api/violations` — all derive `organizationId`
  from the session and filter by it.
- **BYOK encryption at rest** (`lib/encryption.ts`): real AES-256-GCM (iv:authTag:ciphertext).
- **Test suite**: 26 passing Python tests (telemetry, budget engine, provider routing, refund flow).

---

## 3. Missing Features

| # | Missing | Impact |
|---|---|---|
| M1 | **Agent → gateway token issuance.** `runtime/routers/auth.py` is a healthcheck only. No `client_credentials`/token endpoint mints the `GATEWAY_SECRET` JWT (`sub`,`org`) the gateway requires. | **Core product unusable.** Agents created in the UI cannot call the gateway. |
| M2 | **BYOK not wired to gateway.** `ProviderCredential` keys are encrypted & stored but `provider_factory` only reads platform env keys. | Customer requests would bill **WHOAI's** keys, not theirs. Breaks the value prop + cost model. |
| M3 | **Billing/Stripe disabled.** Everything under `disabled/billing_disabled` & `disabled/webhooks_disabled`. | No revenue path — directly contradicts the stated mission. |
| M4 | **Reveal/rotate agent secret.** Agent `apiKey` is shown once at creation; no rotate, no list of keys, no way to recover. | Operational dead-end for customers. |
| M5 | **Alerts surfacing.** Alerts are created by kill switch/budget, but no notification delivery is verified (`lib/email-alerts.ts` unverified) and the alerts screen is partial. | Weakens the "Datadog for AI" promise. |
| M6 | **Email verification / password reset** (`app/auth/verify-email`, `forgot-password` is new & unreviewed). | Onboarding friction; reset is untested. |
| M7 | **Landing page GTM elements** (Calendly, working contact form) unverified vs `MVP_CHECKLIST`. | Blocks demo-request funnel. |

---

## 4. Broken Features

| # | Broken | Evidence |
|---|---|---|
| B1 | **8 gateway/kill-switch/budget tests fail with 404.** The gateway endpoint isn't reachable at the path the tests call → routing/mount mismatch between `runtime/main.py` (`/api/v1`) and tests. | `pytest`: `assert 404 == 401/402/400` in `test_gateway.py`, `test_kill_switch.py`, `test_budget_engine.py`. |
| B2 | **Python `X-API-Key` auth can never match.** `runtime/auth.py` compares `Agent.apiKey == api_key`, but `apiKey` is stored **bcrypt-hashed** by the Next.js creator. Plaintext == hash is always false. | `app/api/agents/route.ts` hashes with `bcrypt.hash(rawKey, 12)`; `runtime/auth.py` does equality. |
| B3 | **`/api/analytics/*` returns hardcoded mock data** (`Research Agent: $420`, fixed weekday series). A landmine: any UI wired to these shows fake numbers as if real. (Dashboard currently uses the real `/api/dashboard/*`.) | `app/api/analytics/spend-by-agent/route.ts`, `spend-over-time/route.ts`. |
| B4 | **Dashboard has no auth guard.** `proxy.ts` only redirects *authenticated* users away from auth pages; it never blocks *unauthenticated* access to `/(dashboard)`. `app/(dashboard)/layout.tsx` has no session check. | `proxy.ts`, `app/(dashboard)/layout.tsx`. |
| B5 | **Agent `clientSecret` is unusable.** bcrypt-hashed at creation with no exchange flow, so client-credentials can't be implemented against it without storage changes. | `app/api/agents/route.ts`. |

---

## 5. Security Issues

| Sev | Issue | Location | Fix |
|---|---|---|---|
| **High** | **DATABASE_URL (with credentials) logged to stdout** — twice, at module load. Leaks into Vercel/host logs. | `lib/prisma.ts` | Remove both `console.log`s. |
| **High** | **Full Supabase signup object logged** (`console.log("SUPABASE SIGNUP:", signup)`) — includes session/access tokens. | `app/api/auth/signup/route.ts` | Remove. |
| **High** | **CORS `allow_origins=["*"]` with `allow_credentials=True`** on the gateway. Over-permissive (and spec-invalid for credentialed requests). | `runtime/main.py` | Restrict to the app origin(s). |
| **Med** | **PII/auth debug logging** across `getServerAuthContext` (user emails, JWT payloads), login error object. | `lib/server/auth.ts`, `app/api/auth/login/route.ts` | Strip. |
| **Med** | **`GATEWAY_SECRET` defaults to `"dev_secret"`** if env unset — silently insecure tokens. | `runtime/routers/gateway.py` | Fail closed in production. |
| **Med** | **Error stack returned to client** in signup non-prod branch; `String(error)` exposes internals. | `app/api/auth/signup/route.ts` | Return generic message. |
| **Med** | **No auth route guard** (see B4). Unauthenticated dashboard shell loads. | `proxy.ts` | Block unauthenticated `(dashboard)` access. |
| **Low** | **No rate limiting** on auth/gateway endpoints. | global | Add basic limiter before launch. |
| **Low** | `whoai_test.db` committed to git (test SQLite). No live secrets in it, but should not be tracked. | repo root | `git rm --cached`. |
| Info | `.env*` files are **correctly gitignored** — no live secrets committed. Confirmed via `git ls-files`. | — | OK. |

---

## 6. Technical Debt

- **Two overlapping stacks**: Next.js API routes *and* FastAPI both touch spend/agents. Boundaries
  are mostly clean (control plane vs data plane) but `lib/` contains ~30 engine directories
  (`spend-engine`, `cost-engine`, `token-engine`, `forecast-engine`, `anomaly-engine`, `mock`, `data`, …)
  with substantial dead/duplicate logic. `knip` is installed — run it to prune.
- **Duplicate real-vs-mock routes**: `/api/dashboard/*` (real) vs `/api/analytics/*` (mock). Delete the mocks.
- **Two bcrypt libs**: both `bcrypt` and `bcryptjs` are dependencies.
- **Committed build/junk**: `project-structure.txt` (602 KB), `tsconfig.tsbuildinfo`, empty marker files
  (`next`, `npm`, `openapi.json`, `structure.txt`).
- **Deprecation**: `datetime.utcnow()` in `runtime/telemetry/metrics_service.py`.
- **Migration naming** inconsistency (`000_init`, `001_phase7_…`, then timestamped).
- **Leftover agent artifact**: `project_info__1.md` (a prior assistant's "Explore Mode" message) committed to root.

---

## 7. Production Blockers (ordered)

1. **P0 — Secret/PII logging** (`DATABASE_URL`, Supabase session tokens). *Fast, high-value.*
2. **P0 — Agent token issuance missing** → product core unreachable (M1, B2, B5).
3. **P0 — Dashboard unprotected + CORS wide open** (B4, security table).
4. **P0 — Failing gateway tests** (B1) — must be green before trusting the data plane.
5. **P1 — BYOK not wired** (M2) — required for the cost model to be truthful.
6. **P1 — Billing disabled** (M3) — required to take money.
7. **P2 — Delete mock analytics routes** (B3), agent key rotation (M4), alerts UX (M5).
8. **P3 — Tech-debt prune, landing-page GTM, email flows.**

---

## 8. Prioritized Roadmap (24-day MVP)

**Week 1 — Make it safe & make the core reachable**
- [x] Audit (this document).
- [ ] **Strip secret/PII logging** (prisma, signup, login, auth-context).
- [ ] **Implement agent-token endpoint** (`POST /api/v1/auth/token`, client_credentials → `GATEWAY_SECRET` JWT). Resolve the bcrypt-hash mismatch (B2/B5) with a verifiable credential.
- [ ] **Guard dashboard routes** in `proxy.ts`; **lock CORS** to app origin.
- [ ] **Fix failing gateway tests**; add a token-issuance + end-to-end gateway test.

**Week 2 — Make it truthful & monetizable**
- [ ] **Wire BYOK**: gateway loads & decrypts the org's `ProviderCredential` and passes it to the provider; fall back to platform key only where intended.
- [ ] **Re-enable Stripe** (checkout, portal, webhook) behind `Subscription`/`Organization` fields already in the schema.
- [ ] Delete mock `/api/analytics/*`; ensure every dashboard widget reads org-scoped real data.

**Week 3 — Make it complete**
- [ ] Agent key list + rotate/revoke.
- [ ] Alerts: delivery (email) + alerts screen polish.
- [ ] Email verification + password reset hardening.
- [ ] Landing page GTM (headline, pilot offer, Calendly, working contact form).

**Week 4 — Make it launchable**
- [ ] Demo org + seed (5 agents, 500 spend logs) verified end-to-end.
- [ ] Rate limiting, prune dead `lib/` engines (`knip`), remove committed junk.
- [ ] Full E2E pass, screenshots, first-pilot outreach.

---

## 9. Multi-Tenant Isolation Assertion

Every business model in `schema.prisma` carries `organizationId`. Control-plane routes derive it from
the session (`getServerAuthContext`) and filter by it; the data-plane gateway validates
`agent.organizationId == token.org` before serving. **No isolation regressions are permitted** —
all new queries must filter by `organizationId`, and the agent-token work must bind the token's `org`
claim to the authenticated agent's organization.

---

*Fixes begin immediately after this report, in the P0 order above, committed in logical batches.*
