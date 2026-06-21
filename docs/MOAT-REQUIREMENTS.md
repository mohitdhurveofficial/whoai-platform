# WHOAI Moat Requirements — Phases 1–4

What it actually takes to go from *"a swappable cost+continuity gateway"* (today, defensibility ~2/10) to *"the independent enforcement-record-of-record for regulated AI"*. Written against the real code state (verified against `prisma/schema.prisma`, `runtime/encryption.py`, `runtime/routers/gateway.py`).

**North star:** WHOAI proves — verifiably, across every vendor, by a party that earns nothing on the tokens — that your spend caps, model policies, and kill switches actually fired.

**Unbreakable rule (all phases):** keep **$0 margin on tokens**. Never ship the `REVENUE_MODEL.md §5` "2–3% of managed spend" model — it re-correlates revenue with consumption and destroys the neutrality the whole moat rests on. Bind it contractually.

---

## PHASE 1 — Build the moat (Years 1–2)
**Become:** the early independent enforcement-record-of-record · **Target:** ~$1–5M ARR

### 1.0 Prerequisite — One canonical control path
- **Why:** a control plane that can be bypassed makes every moat above it bypassable.
- **Current:** two live gateways (Python `runtime/routers/gateway.py` + a TS route) with different auth.
- **Required:** pick ONE enforcing path; route 100% of traffic through it; deprecate/disable the other; add a test that fails if a second path can serve a request.
- **Done when:** every billable call provably transits the one path; % of org traffic through canonical path is measurable.

### 1.1 Tamper-evident enforcement ledger + public verify
- **Current:** `SpendLog`/`ActivityLog`/`RequestLog` = plain mutable Postgres rows, no integrity fields. (The trust page's old "hash chaining" claim is now correctly moved to roadmap.)
- **Required:**
  - Schema: add `sequence` (per-org monotonic), `prevHash`, `hash`, `signature` to the canonical log model(s); make inserts an append-only chain on the single path.
  - Each record signs: agent id, actor/authorizer, policy evaluated, **verdict** (allowed / capped / blocked / rerouted), cost, timestamp — and proof the limit was enforced *before* the call.
  - Per-period **Merkle root**; anchor roots to an external **WORM store** (object-lock) and/or **RFC-3161 / public timestamp** so post-hoc edits are mathematically detectable.
  - Signing keys in an HSM/KMS; key rotation + a published key history.
  - **Audit-log export** endpoint (JSON/CSV) — the thing the site already advertised.
  - **Public `/verify` endpoint** — anyone can verify a record/root without trusting WHOAI.
- **Done when:** an external auditor can independently verify a customer's history; tampering is detectable; export + verify are live.
- **Effort:** ~2–4 engineer-months (backend + crypto). Highest moat-per-effort — it converts already-captured data into a non-portable asset.

### 1.2 Per-tenant key custody (true non-custody)
- **Current:** single shared `ENCRYPTION_KEY` decrypts *every* tenant's provider key in-path → cross-tenant honeypot; one breach = DigiNotar-style end. `Organization.kmsKeyArn` is dormant.
- **Required:**
  - Wire `Organization.kmsKeyArn` to **per-tenant KMS** (AWS KMS / GCP KMS / customer-held key) so no single platform key decrypts all tenants.
  - **Self-hosted / VPC tier** where keys never leave the customer perimeter (makes "we never hold your keys" literally true).
  - Envelope encryption; per-tenant data-key isolation; key-access audit logged into the ledger (1.1).
- **Done when:** compromising one key cannot expose a second tenant; "your keys, your perimeter" is provable, not contractual.
- **Effort:** ~1.5–3 engineer-months + infra. **Do early — it's a standing security liability today.**

### 1.3 Agent identity (replace the shared secret)
- **Current:** one shared `GATEWAY_SECRET` HS256 JWT signs every tenant's agents (`gateway.py:60`).
- **Required:**
  - Per-agent keypairs / per-agent signing; short-lived, rotating tokens.
  - Real lifecycle tied to `AgentStatus` (ACTIVE / PAUSED / QUARANTINED / TERMINATED): mint, rotate, **revoke**.
  - Position as "**identity provider for AI agents**" — every minted identity deepens the dependency.
- **Done when:** an agent's access can be revoked instantly and provably; no shared secret can forge another tenant's agent.
- **Effort:** ~1.5–3 engineer-months.

### 1.4 Policy engine (enforce, don't just store)
- **Current:** `Policy.ruleDsl` exists in schema but is **not parsed/enforced**; governance is budget-only.
- **Required:**
  - Parse `ruleDsl` into an in-path evaluator: **DENY / REQUIRE_APPROVAL / FLAG** on model, provider, data-class, spend ceiling, time window — evaluated *after* the kill-switch / budget checks.
  - **Approval queue** for REQUIRE_APPROVAL (human-in-the-loop gate).
  - Each verdict emits a signed attestation into the ledger (1.1): "policy X v.N evaluated and enforced at T".
  - Policies are versioned + exportable as evidence.
- **Done when:** you can *prove a control fired*, not just that it was configured.
- **Effort:** ~2–4 engineer-months.

### 1.5 SOC 2 Type II
- **Current:** not held; "actively pursuing" copy.
- **Required:** select auditor; define control scope (covering 1.1–1.4); **3–12 month observation window** (calendar-bound — start NOW, in parallel with the build); remediate findings; publish dated report. Replace "actively pursuing" copy only when dated.
- **Done when:** a clean SOC 2 Type II report exists and is shareable under NDA.
- **Effort:** calendar-bound (not engineering volume) + ~$30–80k audit cost + a part-time compliance owner.

### 1.6 (Related) Governed failover hardening
- **Current:** caller-supplied `fallback` field in the request body; on-demand health check; no drills/RTO/circuit-breakers.
- **Required:** move continuity policy from the request body into the control plane; provider health monitoring; circuit-breaker auto-reroute; a scheduled **failover drill** producing a signed attestation. Only then upgrade the marketing wording beyond "set a fallback".
- **Effort:** ~1.5–3 engineer-months.

### Phase 1 cross-cutting
- **Team:** ~4–8 people — 2–3 platform/backend (Python/FastAPI + crypto), 1 infra/SRE, 1 security lead, part-time compliance PM, founder-led sales.
- **Reliability (you ARE the path):** multi-region, high-availability, and an explicit **fail-closed vs fail-open** decision per control (budget should fail-closed; total-outage behavior is a deliberate tradeoff).
- **Capital:** roughly seed → Series A (~$1–3M deployed across salaries, audit, infra).
- **Exit criterion for the phase:** one genuinely **non-portable, soon-to-be-attested asset** (the ledger) + one standing dependency (agent identity) in production; first regulated design partners signed.

---

## PHASE 2 — Own the niche (Years 2–4)
**Become:** category leader for regulated buyers (finance, health, defense, insurance, public sector) · **Target:** ~$5–20M ARR

### 2.1 ISO/IEC 42001 (+ maintain SOC 2 Type II)
- **Required:** AI management-system certification (the differentiator few hold); recurring SOC 2 cycles; evidence escrow; E&O / cyber insurance for the attestations you produce.
- **Done when:** you hold certifications a regulated buyer's auditor recognizes.
- **Effort:** calendar-bound + dedicated compliance program manager + ~$50–150k/yr certification & audit.

### 2.2 AI Governance Report (the sellable artifact)
- **Required:** one-click, signed export combining the decision ledger + policy verdicts + budget/kill-switch events + continuity attestations, **pre-mapped** to **EU AI Act**, **NIST AI RMF**, **SR 11-7**, **ISO 42001**, **SOC 2 CC-series**.
- **Sell to:** GRC / CISO / model-risk buyer — not just FinOps. This is what justifies premium enterprise pricing.
- **Done when:** a customer hands the report to their auditor/board and it's accepted as evidence.
- **Effort:** ~2–4 engineer-months + a compliance-mapping specialist.

### 2.3 SSO / SCIM / enforced RBAC
- **Current:** `User.role` is a decorative column; no SSO/SCIM.
- **Required:** SAML/OIDC SSO; SCIM provisioning; turn `role` into **enforced** authorization across every API; wire into enterprise joiner/mover/leaver + change-control. This is the deepest *organizational* switching cost.
- **Done when:** WHOAI is provisioned through the customer's IdP and removing it requires IT change-control, not a config edit.
- **Effort:** ~2–4 engineer-months.

### 2.4 Auditor portal
- **Required:** scoped, read-only portal so the *customer's external auditor* becomes a direct WHOAI user and your evidence format plants on the assessor side.
- **Done when:** auditors log in and verify evidence directly.
- **Effort:** ~1.5–3 engineer-months.

### 2.5 "Written into customers' control docs" motion (GTM, not just code)
- **Required:** reference policy language ("insert WHOAI as your AI-spend and continuity control"); SR 11-7 / EU AI Act mapping kits; land **5–8 named regulated design-partner logos** with WHOAI named as the enforcing/evidencing control in *their* documents.
- **Done when:** removing WHOAI means re-opening passed audits + re-drafting board-approved policy. **This is the real lock-in.**
- **Effort:** sales-led; months per logo; needs a regulated-industry AE + solutions/compliance support.

### Phase 2 cross-cutting
- **Team:** ~10–20 — platform + security eng, dedicated GRC/compliance, regulated-industry sales + solutions engineering, customer success.
- **Capital:** Series A/B (~$5–15M).
- **Metrics of indispensability:** NRR > 120%; # customers where WHOAI is **named in their own control docs** (zero today); auditor-acceptance events; months of externally-anchored history accumulated per customer.

---

## What would kill the requirements (defend each)
1. **Trading away neutrality** (% of managed spend) → never ship it; ring-fence the cap table.
2. **The custody honeypot** (1.2) shipping late → do it early.
3. **Over-claiming before it's built** → keep marketing in lockstep with shipped capability (already reconciled at launch).
4. **A standard emerges you don't author** (OTel-GenAI / SPIFFE-for-agents + signed audit schema) → help author it; be the reference implementation.
5. **Hyperscaler bundles "good enough" free** → win the regulated/independence-requiring segment first, where free-but-conflicted loses.
6. **You are the outage** → multi-region + reliability SLA before scaling enterprise.

## Honest framing
These scores (5–7/10) describe the *destination*. Each capability only becomes a moat **after** it is built, enforced on the one path, externally anchored, third-party attested, and written into the customer's own governance documents — a 12–24 month, auditor-gated, calendar-bound climb. Positioning buys the window; only this execution builds the moat. Win the race before a hyperscaler ships good-enough for free or a neutral standard commoditizes the layer.
