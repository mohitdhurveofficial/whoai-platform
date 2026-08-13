# WHOAI — Vision vs. Code Audit

_Date: 2026-06-16. Read-only audit of the codebase against the product vision (AI FinOps / observability / governance control plane). Findings below are file-referenced; the five most severe were manually re-verified (noted ✅verified)._

## ✅ Fixed in the 2026-06-16 remediation pass

- **P0 #1–3** — deleted the entire orphaned `app/api/ai-workers/*` route family (passwordless login, cross-tenant agent IDOR, passwordless signup, unauthenticated debug endpoint). No code referenced them; maintained equivalents live in `app/api/auth/*` and `app/api/agents/*`.
- **P1 #5** — org pause/resume now actually write `status`/`pausedAt`/`pauseReason` (were empty `data: {}`), so the org kill switch can be triggered.
- **P1 #4** — added `app/api/cron/reset-budgets` (secured by `CRON_SECRET`) + `vercel.json` daily schedule. Resets daily counters every day and monthly on the 1st (UTC), and auto-resumes agents/orgs the SYSTEM paused for a budget breach. **Requires setting `CRON_SECRET` in the deploy env.**

Remaining items below are NOT yet done.

## Executive summary

The **core MVP is ~80% real**: the Python gateway captures telemetry, enforces budgets + kill-switch + strict BYOK; the dashboard/analytics read it; Stripe billing is production-quality. But the audit surfaced **two critical security holes**, several **budget/cost-integrity defects**, and a **structural problem**: most features exist in *two divergent implementations* (a Python gateway and a TS gateway) plus a large body of **dead TS engine code** that looks live but is never called.

### Scorecard (vision MVP)

| Feature | Status | Notes |
|---|---|---|
| Unified gateway | 🟡 split | Two gateways, different auth — not unified |
| Virtual API keys `wk_` | ✅ | TS only (`wk_live_`) |
| BYOK (no platform billing) | ✅ strong | gateway fails closed; but provider env-key fallback is a latent leak |
| Usage analytics | ✅ | latency/status/filters real |
| Cost analytics | 🟡 | float pricing, 4 drifting tables, fake per-row values |
| Budget controls | 🟡 | enforced but counters never reset → lifetime caps |
| Runaway detection | 🔴 dormant | real detector exists, **never called**; demo is hardcoded |
| Audit logs | ✅ | Python path; TS path partial |
| MFA / TOTP | 🔴 missing | zero code |
| Provider health + auto-reroute | 🔴 missing | on-demand checks only; status page is fabricated |
| Policy engine (allow/block models) | 🔴 missing | `ruleDsl` never parsed; "GovernanceEngine" is budget-only |
| RBAC | 🔴 not enforced | `role` is a decorative column |

---

## P0 — Critical (fix before any customer traffic)

1. **Auth bypass — passwordless login as any user.** ✅verified
   [app/api/ai-workers/auth/login/route.ts:43](../app/api/ai-workers/auth/login/route.ts#L43) hardcodes `const validPassword = true;` then issues a valid `whoai_auth` JWT (OWNER) for any email that exists. `User` has no password column. → account takeover for every tenant.
   **Fix:** delete the `ai-workers/auth/*` routes (the maintained auth lives in `app/api/auth/*` on Supabase), or gate behind real password/bcrypt.

2. **Cross-tenant IDOR — edit/delete any agent.** ✅verified
   [app/api/ai-workers/[id]/route.ts](../app/api/ai-workers/[id]/route.ts) PUT/DELETE by `id` with **no auth and no `organizationId` scoping** (also a stray `new PrismaClient()`). Anyone can rename/pause/delete any org's agents.
   **Fix:** delete these routes (superseded by `app/api/agents/[id]/route.ts`, which is properly scoped) or add `getServerAuthContext` + org scoping.

3. **Shadow signup creates passwordless users + leaks stack traces.**
   [app/api/ai-workers/auth/signup/route.ts](../app/api/ai-workers/auth/signup/route.ts) creates User+Org directly in Prisma with no password; chains with #1 into full unauth account creation→login. **Fix:** delete.

> P0 #1–3 are all the legacy `ai-workers/*` route family — likely abandoned scaffolding shipping next to the hardened `auth/*` + `agents/*` routes. Recommend deleting the whole family after confirming nothing references it.

---

## P1 — High (budget/cost integrity & correctness)

4. **Daily/monthly spend counters are never reset.** ✅verified (no scheduler exists)
   No cron/scheduled job anywhere. `currentDailySpend`/`currentMonthlySpend` only ever increment (`runtime/telemetry/spend_logger.py`). Once tripped, an agent/org is auto-paused **permanently**; "daily" budgets behave as lifetime caps. **Fix:** add a scheduled reset (daily/monthly) — cron worker or Postgres scheduled job.

5. **Org kill switch can't be triggered — pause API is a no-op.** ✅verified
   [app/api/organizations/[id]/pause/route.ts:23-24](../app/api/organizations/[id]/pause/route.ts#L23) updates with empty `data: {}`; never sets `status/pausedAt/pauseReason`. Returns success + writes an alert but the org is never paused, so the gateway kill-switch never fires from a manual pause. (resume route mirrors this.) **Fix:** write `status: "PAUSED", pausedAt, pauseReason`.

6. **Runaway-agent detection is never executed.**
   `runtime/telemetry/anomaly_detector.py` is a genuine 7-day-baseline detector but has **zero callers**; `app/api/demo/runaway-agent/route.ts` returns static JSON. The headline "runaway detection + auto-pause" is not live. **Fix:** call `detect_anomalies` after `update_daily_metrics`, and/or in the scheduled job from #4.

7. **Wrong cost function in production (float, not Decimal).**
   Gateway uses `from runtime.telemetry.pricing import calculate_cost` (float, [pricing.py:48-55](../runtime/telemetry/pricing.py#L48)); the precise `cost_calculator.calculate_cost` (Decimal) is dead. Also `get_pricing` silently **defaults unknown models to gpt-4o pricing**. **Fix:** use the Decimal calculator; make unknown models log $0 + warn (or hard-fail) instead of mispricing.

8. **Budget overshoot + concurrency race.**
   Checks compare already-recorded spend with `>=` and don't add the in-flight request's projected cost ([budget_service.py](../runtime/budget/budget_service.py)); spend is written *after* the provider call ([gateway.py:303](../runtime/routers/gateway.py#L303)). Concurrent requests all read pre-increment spend and pass → can blow well past budget. **Fix:** pre-reserve projected cost atomically, or check inside the increment transaction.

9. **Streaming spend is fire-and-forget + fabricated.**
   [gateway.py:160-161](../runtime/routers/gateway.py#L160) saves telemetry in a detached task; tokens estimated as `len(delta)//4` and `payload_size//4` ([:133,141](../runtime/routers/gateway.py#L133)), ignoring provider `usage` in the final chunk. Streamed spend is unreliable and can be lost → budgets undercount. **Fix:** parse real usage from stream, persist reliably.

10. **No alerts are ever sent.**
    `lib/email-alerts.ts:sendBudgetAlert` has zero callers; all "alerts" are DB rows only. **Fix:** wire `sendBudgetAlert` into budget breach / pause / anomaly events.

11. **Second (TS Groq) gateway bypasses controls + uses a platform key.**
    [app/api/v1/chat/route.ts](../app/api/v1/chat/route.ts) is a hardcoded-Groq path using platform `GROQ_API_KEY` (violates BYOK), checks only org-monthly budget, and skips kill-switch/agent budgets/anomaly. Appears orphaned but is live. **Fix:** delete or fold into the canonical gateway.

---

## P2 — Vision gaps (features not yet built)

12. **Resolve the dual-gateway split** — pick ONE canonical gateway (auth model, BYOK, policy, telemetry, streaming, fallback). TS has virtual keys + policy hook but no streaming/fallback; Python has streaming/fallback + enforcement but no policy/virtual-keys. See `architecture-two-gateways` memo.
13. **Policy Engine** — `Policy.ruleDsl` is never parsed; "GovernanceEngine" ([lib/services/PolicyEngine.ts](../lib/services/PolicyEngine.ts)) is budget-only. Build a real allow/block (model/provider) evaluator and wire into the canonical gateway.
14. **RBAC enforcement** — `User.role` is never checked; add `requireRole`/admin guards and carry `role` in `ServerAuthContext`.
15. **MFA / TOTP** — none. Add TOTP enrollment + verification (schema + routes).
16. **OpenRouter provider** — confirmed missing from both stacks (only a token-extraction stub). Add adapter + factory + key-format entry.
17. **Real provider health monitoring + auto-reroute** — only on-demand checks (buggy: platform-key based, omits Gemini, unauthenticated). [app/status/page.tsx](../app/status/page.tsx) is **fabricated** (hardcoded 99.9x% + fake incidents) → trust/compliance risk; make it data-driven. Add polling + circuit-breaker auto-reroute.
18. **API key revocation/rotation** — `revoked` column exists but `app/api/api-keys` only has POST. Add list + revoke endpoints/UI.
19. **Enforce `monthlyRequests`/`retentionDays`** plan limits (currently documented but unenforced; only `maxAgents` is enforced).

---

## P3 — Cleanup / polish

20. **Delete dead code** — `lib/{budget,anomaly,alert,forecast}-engine`, `lib/{cost,spend,usage,token}-engine`, `lib/actions/telemetry.py` (empty), `lib/actions/anomaly_engine.py` (empty) are never imported and create false capability signals (and risk a dev wiring the wrong impl).
21. **Single pricing source of truth** — 4 drifting tables (`runtime/telemetry/pricing.py` per-1K, `lib/actions/pricing.py` per-1K, `lib/cost-engine` per-1M, `lib/pricing.ts` per-1M). Consolidate.
22. **Usage table shows fake per-row values** — `getUsageRequests` ([lib/analytics/service.ts:327-340](../lib/analytics/service.ts#L327)) shows averaged tokens/spend on every row though `SpendLog` has real per-record values. Use real values.
23. **Weekly/monthly time-series + success/failure rate** — only daily grouping; no rate metric computed.
24. **Retry on non-retryable errors** — `execute_with_retry` retries all exceptions incl. 4xx/auth ([gateway.py:163-173](../runtime/routers/gateway.py#L163)).
25. **Gemini provider** — `genai.configure()` mutates process-global state (cross-tenant key race under concurrency); health check runs a billable generation; `system` role mapped to `user`.
26. **Tier naming** — vision says "Business"; code uses "Pro". Align docs or code.
27. **JWT hardening** — no `aud`/`iss`, no revocation/blocklist (7-day stateless); logout only clears cookie.

---

### Strongest areas (keep as-is)
- **Stripe billing** — idempotent webhooks, proration-safe upgrade/downgrade, past_due recovery, multi-tenant scoping, `maxAgents` actually enforced.
- **BYOK encryption** — AES-256-GCM, TS/Python wire-compatible, masked display, never logs keys.
- **Tenant scoping** in the maintained `agents`/`providers`/`dashboard` routes via `getServerAuthContext`.
