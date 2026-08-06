# Enforcement Ledger — Engineering Ticket Set (Phase 1.0 + 1.1)

> Generated from the `ledger-ticket-set` workflow, grounded in the verified WHOAI codebase. This is the #1 build priority: the tamper-evident enforcement ledger that turns WHOAI from a dashboard into an independent enforcement-record-of-record.

## Epic

Phase 1.1 builds a tamper-evident enforcement ledger with a public, trust-no-WHOAI verification path on top of the WHOAI BYOK gateway. Today there are TWO live enforcing write paths (Python FastAPI `runtime/routers/gateway.py` and TS `app/api/v1/chat/completions/route.ts`) writing the same mutable Supabase tables; the FastAPI path is the only one with a true atomic pre-call budget reservation (`runtime/budget/budget_service.py:26-66`) and is therefore canonical. Phase 1.0 (a hard gate, tickets LEDGER-1..LEDGER-4) collapses to that single serialized writer, binds actor identity to the JWT credential, and creates one synchronous transactional serialization point — because a per-org monotonic hash chain forks under two uncoordinated writers. Phase 1.1 then adds: a new append-only `LedgerEntry` table (dual-ORM lockstep), a byte-exact cross-language canonical serialization, per-record SHA-256 chaining (sequence + prevHash + recordHash) + Ed25519 signatures with a published-key/rotation trust model, daily per-org Merkle-root rollup anchored to a free RFC-3161 TSA, DB-level WORM (REVOKE + trigger), an authenticated org-scoped JSON/CSV export, and a PUBLIC `/verify` endpoint + page + standalone reference verifier. Each ledger record binds {agentId, actor/authorizer, policy evaluated (sentinel IMPLICIT_BUDGET_KILLSWITCH_v1 for v1), verdict (ALLOWED|CAPPED|BLOCKED|REROUTED), estimatedCost+cost, single canonical timestamp, and a persisted enforcementProof that the limit was checked BEFORE the provider call}. DEFINITION OF DONE: (1) only one path can produce SpendLog/RequestLog/ActivityLog rows, enforced by a CI test; (2) every request outcome yields exactly one chained, signed LedgerEntry committed in the same transaction as the enforcement decision; (3) the ledger table is append-only at the DB level and agent-delete no longer hard-deletes telemetry; (4) daily Merkle roots are sealed and anchored to an external TSA; (5) a third party with only the published public key + a downloaded export + the public TSA receipt can prove inclusion and detect a single flipped byte without any WHOAI credential or DB access; (6) all golden-vector tests pass identically across the Python writer and the TS recompute. Scope is bounded by the design's out-of-scope list (no KMS, no S3 Object Lock, no second anchor, no Policy-DSL enforcement, no real RBAC, no retro-chaining of historical rows, no streaming actual-cost second chained entry, no making the ledger the live enforcement source-of-truth).

## Design decisions

- CANONICAL PATH = FastAPI Path A (runtime/routers/gateway.py). It owns the only true atomic pre-call budget reservation (budget_service.py:26-66), persists verdicts, and is the documented data plane. Path B (app/api/v1/chat/completions/route.ts) is retired -> thin proxy first, then 410; public docs (app/docs/page.tsx:14, app/docs/quickstart/page.tsx:78) re-pointed.
- 1.0 IS A HARD GATE before any chaining ticket: a per-org monotonic hash chain forks under two writers. Collapse to one path, bind actor identity to the JWT credential (never the x-agent-id header), and create ONE synchronous transactional serialization point before building the ledger.
- NEW append-only LedgerEntry table (not columns on the 3 mutable tables) — one clean chain per org. Requires THREE lockstep edits: prisma/schema.prisma + manual `npx prisma migrate deploy` (not in CI) + database/models.py with the metadata_=Column('metadata',JSON) alias and BigInteger sequence; else the FastAPI plane writes NULL hashes.
- GRAFT-NOW (cheap insurance, impossible to retrofit): (a) the canonical cross-language serialization + golden vectors (RFC-8785-style sorted-key JSON, ms-precision UTC, cost as fixed scale-8 string never float); (b) the asymmetric Ed25519 signing trust model with signingKeyId + an append-only rotation registry + a published public-key endpoint; (c) the public /verify contract that takes a submitted proof bundle and returns only verification math.
- MVP-NOW (defer the heavy version): env-held Ed25519 private key on the Render plane (KMS deferred), a single free RFC-3161 TSA anchor (WORM object-lock + second anchor deferred), one daily Merkle rollup reusing the CRON_SECRET fail-closed cron pattern.
- VERDICT enum = ALLOWED | CAPPED | BLOCKED | REROUTED, mapped from the real lifecycle (budget pre-reservation fail / kill-switch block -> BLOCKED; caller fallback used -> REROUTED). enforcedBeforeCall + enforcementProof JSON capture the pre_reserve_* rowcount + kill-switch state as the persisted 'enforced before the call' attestation.
- STREAMING is handled by appending the ledger row SYNCHRONOUSLY at the pre-call enforcement boundary (verdict + estimatedCost are known at gateway.py:301-323) — NOT in the detached _save_telemetry task (gateway.py:196-219); the detached tail only reconciles actual cost into the satellite SpendLog, never the sealed ledger row.
- CONCURRENCY: allocate the per-org chain head under pg_advisory_xact_lock(hashtext(orgId)) + @@unique([organizationId, sequence]) inside the enforcement-decision transaction, reusing the atomic-SQL discipline already proven in budget_service.py.
- APPEND-ONLY enforced at the DB (REVOKE UPDATE/DELETE/TRUNCATE on the app role + a BEFORE UPDATE/DELETE trigger); fix the active violations (agent-delete hard-deletes at app/api/agents/[id]/route.ts:132-139 -> soft-delete/tombstone; seed-dashboard bulk inserts gated to non-prod). Keep entries strictly immutable by storing leaf->period mapping in a side table rather than back-stamping sealed rows.
- EXPORT lives in Next (app/api/ledger/export/route.ts): getServerAuthContext + scope-by-organizationId + parseUsageFilters + Pro-tier gate via subscriptionTier; output is self-verifiable (per-record hash/sig/signingKeyId + Merkle inclusion proof + root sig + anchor ref). /verify lives in Next too, public-by-design, and MUST NOT replicate the violations/alerts query-string IDOR.
- FAIL-CLOSED on ledger/signing failure for ALLOWED requests (release reservation, 503); FAIL-SAFE for BLOCKED; FAIL-OPEN for anchor outages (alert on stuck-PENDING roots). Boot-time fast-fail if the signing key is unreadable, mirroring the GATEWAY_SECRET guard.
- DO NOT retro-chain historical mutable rows; emit a signed+anchored per-org genesis attestation of the pre-ledger high-water mark, chain forward, and disclose on app/trust/page.tsx that verifiable history begins at activation T0 (upgrade marketing copy from 'roadmap' to 'live' only after /verify is externally verifiable).

## Explicitly OUT OF SCOPE for Phase 1.1

- KMS/HSM-custodied signing keys — v1 uses an env-held Ed25519 private key on the single Python/Render plane; Organization.kmsKeyArn stays dormant. No boto3/@aws-sdk/google-cloud exist today; the signingKeyId + published-key model is built now so swapping to KMS later changes only key custody, not any issued proof.
- S3 Object Lock / true WORM storage for anchor receipts and root exports — MVP keeps receipts in Postgres and relies on DB-level REVOKE/trigger for app-layer WORM plus the external TSA anchor; cloud SDK + bucket + retention policy deferred.
- A second/independent external anchor (OpenTimestamps / public blockchain / transparency log) — MVP ships one free RFC-3161 TSA anchor; defense-in-depth second anchor is a later hardening step.
- Policy DSL enforcement — Policy.ruleDsl is dormant and neither path evaluates it; v1's policyId/verdictReason honestly reflect only the implicit budget + kill-switch ruleset (sentinel IMPLICIT_BUDGET_KILLSWITCH_v1). Recording a real evaluated policy is a later phase.
- Real RBAC on export/audit features — gated by subscription tier only; User.role stays decorative (it is decorative across all ~25 routes today). Role-based authorization is future work.
- Retroactive chaining/back-signing of existing SpendLog/ActivityLog/RequestLog history — explicitly excluded; their integrity was never guaranteed, so only a forward chain + a one-time genesis attestation are in scope (optionally a clearly-labeled lower-assurance 'historical snapshot root').
- A second chained verdict for the streaming actual-cost reconciliation tail — MVP chains only the synchronous pre-call verdict+estimate; the post-stream actual cost is a non-chained satellite reconciliation, not a second ledger entry.
- Fixing the unrelated pre-existing IDOR routes (app/api/violations/route.ts, app/api/alerts/route.ts) and the dual Next deploy config (vercel.json vs netlify.toml) beyond what /verify needs — noted as security/ops debt and as the explicit anti-pattern to avoid, but not Phase 1.1 deliverables.
- Per-tenant signing keys — Phase 1.1 uses a single platform ledger-signing key with rotation history; per-org key custody (the intended kmsKeyArn design) is a separate later phase.
- Adopting the ledger as the live spend-enforcement source-of-truth — Phase 1.1 keeps the denormalized currentDailySpend counters as the fast enforcement cache (reset by the reset-budgets cron) and treats the ledger as the authoritative AUDIT/attestation record; making enforcement itself derive from the immutable chain is deferred.

---

## Tickets

### LEDGER-1 — Phase 1.0 gate: collapse to one canonical enforcing path (retire TS Path B)

**Type:** backend  ·  **Effort:** L  ·  **Depends on:** none

Make the FastAPI gateway (runtime/routers/gateway.py) the SOLE path that enforces budget/kill-switch and writes the ledgered tables. Reduce app/api/v1/chat/completions/route.ts POST to a thin reverse-proxy to the Render FastAPI origin: mint the agent JWT server-side from the org ApiKey + a server-resolved agentId, forward to the FastAPI /api/v1/chat/completions, and stream/return its response. Remove all parallel telemetry writes on the TS path: SpendEngine.recordSpend, UsageEngine.updateUsage, and the inline prisma.requestLog.create at route.ts:139-167 (the swallow-all try/catch at route.ts:138-172). This makes lib/spend-engine, lib/usage-engine, lib/budget-engine, lib/services/PolicyEngine.ts (GovernanceEngine), and lib/gateway/adapters dead on the request path. Re-point public docs (app/docs/page.tsx and app/docs/quickstart/page.tsx) so customers either hit the proxy or the Render origin directly. This is a HARD GATE: a per-org monotonic hash chain forks under two uncoordinated writers, so nothing below is correct until this lands.

**Acceptance criteria:**
- A POST to the Vercel /api/v1/chat/completions path produces ZERO direct SpendLog/RequestLog/ActivityLog rows from the Next process; any rows that exist for that request were written by the FastAPI gateway it proxied to.
- No spendLog.create / requestLog.create / SpendEngine / UsageEngine / GovernanceEngine call remains on any request path under app/ (grep-clean).
- The TS route forwards a server-minted agent JWT (HS256, GATEWAY_SECRET) whose sub/org are derived from the validated ApiKey + a server-resolved agentId, never from the caller-supplied x-agent-id header.
- app/docs/page.tsx and app/docs/quickstart/page.tsx no longer instruct customers to send x-agent-id to a path that writes telemetry directly.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/app/api/v1/chat/completions/route.ts
- /Users/mohitdhurve/Movies/whoai-platform/app/docs/page.tsx
- /Users/mohitdhurve/Movies/whoai-platform/app/docs/quickstart/page.tsx
- /Users/mohitdhurve/Movies/whoai-platform/runtime/routers/auth.py
- /Users/mohitdhurve/Movies/whoai-platform/lib/spend-engine/index.ts
- /Users/mohitdhurve/Movies/whoai-platform/lib/usage-engine/index.ts
- /Users/mohitdhurve/Movies/whoai-platform/lib/services/PolicyEngine.ts

**Test plan:**
- Integration test: POST to the Next /api/v1/chat/completions with a valid ApiKey; assert the Next process makes no Prisma writes to SpendLog/RequestLog/ActivityLog (mock prisma and assert no create calls), and that it issues an outbound request to the FastAPI origin with a Bearer JWT.
- CI guard test: a grep/AST assertion that fails if any of spendLog.create, requestLog.create, SpendEngine, UsageEngine, GovernanceEngine appears under app/api/**/route.ts on a request path.
- Manual: run a real completion through the proxy and confirm a single SpendLog row appears, written by the FastAPI plane (matching gateway.py write fields), not duplicated.
- Docs smoke: the curl examples in app/docs resolve to the canonical path and succeed end to end.

---

### LEDGER-2 — Phase 1.0: bind actor identity to the credential (never trust caller-supplied identity)

**Type:** backend  ·  **Effort:** S  ·  **Depends on:** LEDGER-1

Ensure every future ledger record's actor/authorizer derives only from a credential the caller cannot forge. On the canonical FastAPI path the JWT sub (agentId) and org (orgId) are already credential-bound (verified at gateway.py:246-248). The remaining risks: (a) the LEDGER-1 proxy must resolve agentId from the validated ApiKey, never from the x-agent-id header (route.ts:71 today); (b) the caller-supplied 'fallback' provider popped at gateway.py:262 and used at gateway.py:327 must be recorded verbatim but classified as a REROUTED verdict flagged caller-influenced, and must not widen trust. Define the authorizer field semantics now: human/system authorizer comes from kill-switch pausedBy/actorId (kill_switch_service.py metadata, Agent.pausedBy) and is null for autonomous agent calls.

**Acceptance criteria:**
- On the canonical path, actorAgentId and organizationId for any prospective ledger record are populated only from JWT claims (gateway.py identity['sub']/identity['org']).
- The x-agent-id header is no longer consulted as an identity source on any surviving request path.
- A request that uses the caller-supplied 'fallback' provider is documented to map to verdict=REROUTED with a flag indicating the reroute was caller-influenced; the fallback string is recorded but does not change actor trust.
- Authorizer-field resolution rule is documented: from kill-switch actorId/pausedBy where present, else null.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/runtime/routers/gateway.py
- /Users/mohitdhurve/Movies/whoai-platform/app/api/v1/chat/completions/route.ts
- /Users/mohitdhurve/Movies/whoai-platform/runtime/killswitch/kill_switch_service.py

**Test plan:**
- Unit test: a forged/extra x-agent-id header that disagrees with the ApiKey's resolvable agent is ignored; the resolved agentId comes from the credential.
- Unit test: a request with a 'fallback' provider that actually routes to the fallback is classified REROUTED with the caller-influenced flag set.
- Unit test: an autonomous (no human) request yields authorizer=null; a request blocked by a manual pause surfaces the pausedBy/actorId as authorizer.

---

### LEDGER-3 — Phase 1.0: establish one synchronous transactional serialization point per outcome

**Type:** backend  ·  **Effort:** M  ·  **Depends on:** LEDGER-1, LEDGER-2

Today telemetry commits at 6+ sites across two sessions: the request session db (non-stream success commit at gateway.py:374; block/budget commits at 284,292,307,319,382,396) and a detached async_session_maker() inside _save_telemetry for streaming (commit at gateway.py:215, dispatched fire-and-forget at gateway.py:219). Refactor so there is exactly one place per terminal outcome where the ledger entry will be appended as the last write before the commit, on whichever session owns that commit. CRITICAL for streaming: the enforcement verdict + reservation are fully known BEFORE the stream starts (gateway.py:301-323), so the ledger row (verdict, estimatedCost, enforcedBeforeCall=true) must be appended SYNCHRONOUSLY at the enforcement boundary on the request db, not in the detached tail. The detached _save_telemetry only reconciles actual cost into the satellite SpendLog row later (or a non-chained RECONCILED follow-on), never mutating the sealed ledger row. This ticket introduces the single hook location and the synchronous boundary; the actual append_ledger_entry implementation lands in LEDGER-7.

**Acceptance criteria:**
- Every outcome (non-stream completed, streamed-completed, kill-switch blocked, agent-budget exceeded, org-budget exceeded, BYOK-missing, all-providers-failed) has exactly one identified append site, on the session that owns that outcome's commit.
- For streaming, the append site executes synchronously before StreamingResponse is returned (i.e., on the request db at the enforcement boundary), not inside _save_telemetry.
- _save_telemetry no longer owns the verdict record; it is reduced to actual-cost reconciliation + non-ledger telemetry.
- A code comment/spec map enumerates each outcome to its single commit/append site.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/runtime/routers/gateway.py

**Test plan:**
- Trace test (with a stub append hook): drive each of the 7 outcomes and assert the stub is invoked exactly once per request, on the expected session, before that path's commit.
- Streaming test: assert the append hook fires before the first stream chunk is yielded (i.e., synchronously pre-call), and that _save_telemetry does NOT call the append hook.
- Crash test: kill the request between append and commit; assert rollback leaves no half-written telemetry for that request.

---

### LEDGER-4 — Phase 1.0: stop append-only violations (soft-delete agent telemetry; gate seed)

**Type:** backend  ·  **Effort:** S  ·  **Depends on:** none

app/api/agents/[id]/route.ts:132-139 hard-deletes requestLog/usageMetrics/spendLog/alert/policy in a $transaction on agent delete — incompatible with an append-only/WORM ledger. Switch to soft-delete/tombstone: mark the agent TERMINATED (AgentStatus.TERMINATED already exists), retain all telemetry rows, and record the deletion as its own future ledger entry with actor = the deleting user (the AGENT_DELETED ActivityLog at route.ts:124 stays). Never touch the LedgerEntry table from this path. Gate scripts/seed-dashboard.ts (prisma.createMany bulk inserts) to non-prod and keep it out of the ledger table. Confirm app/api/cron/reset-budgets/route.ts only mutates counters (verified: it zeroes currentDaily/MonthlySpend and re-activates SYSTEM-paused rows — fine; counters are the fast cache, not the ledger).

**Acceptance criteria:**
- Deleting an agent no longer issues deleteMany on requestLog/usageMetrics/spendLog; the agent is set to TERMINATED and its telemetry rows persist.
- scripts/seed-dashboard.ts refuses to run (or is a no-op) when NODE_ENV is production / against the prod DB, and never writes to the LedgerEntry table.
- A documented note confirms reset-budgets mutates only spend counters, not any log/ledger table.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/app/api/agents/[id]/route.ts
- /Users/mohitdhurve/Movies/whoai-platform/scripts/seed-dashboard.ts

**Test plan:**
- Integration test: DELETE an agent that has SpendLog/RequestLog rows; assert HTTP 200, agent.status==TERMINATED, and the SpendLog/RequestLog row counts are unchanged.
- Unit test: seed-dashboard invoked with a production-like env throws/aborts before any createMany.
- Regression: reset-budgets run leaves SpendLog/RequestLog/ActivityLog row counts unchanged.

---

### LEDGER-5 — Canonical cross-language serialization contract + golden vectors

**Type:** schema  ·  **Effort:** M  ·  **Depends on:** none

Define ONE byte-exact serialization reproducible by Python (writer), TS (export/verify), and any external auditor — this is graft-now / impossible-to-retrofit. Spec: UTF-8 JSON, lexicographically sorted keys (RFC 8785 / JCS style), camelCase keys matching DB columns, no insignificant whitespace, a single RFC-3339 UTC timestamp at millisecond precision (resolves today's dual timestamp+createdAt and naive-UTC ambiguity by mandating one server-assigned field), cost rendered as a fixed-scale decimal STRING at scale 8 (never a float — SpendLog.cost is Numeric(18,8) per database/models.py:75 / @db.Decimal(18,8) in schema), and null fields omitted by a fixed documented rule. recordHash = SHA-256(canonical(body_without_hash_sig_fields) || prevHash || sequence). SHA-256 exists in both runtimes (Python hashlib, Node crypto) — zero new deps. Ship the spec as a shared doc plus reference encoder functions in both languages and a committed set of golden vectors.

**Acceptance criteria:**
- A documented serialization spec exists covering key ordering, key casing, whitespace, timestamp format/precision, cost-as-string scale 8, and null-omission.
- Python and TS reference encoders produce byte-identical output for the same committed golden-vector inputs.
- SHA-256 over the canonical bytes is identical across Python and TS for every golden vector.
- No new third-party dependency is added in either runtime for hashing or canonicalization.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/canonical.py
- /Users/mohitdhurve/Movies/whoai-platform/lib/ledger/canonical.ts
- /Users/mohitdhurve/Movies/whoai-platform/docs/ledger-canonical-spec.md
- /Users/mohitdhurve/Movies/whoai-platform/tests/ledger/golden-vectors.json

**Test plan:**
- Golden-vector test in Python: for each fixture, assert canonical bytes and SHA-256 match the committed expected values.
- Golden-vector test in TS (vitest): same fixtures, assert identical canonical bytes and SHA-256.
- Cross-language test: a small CI step runs both encoders over the same fixtures and diffs the byte output (must be empty).
- Edge cases: null fields omitted, cost like 0, 0.00000001, and 12345.6789 all serialize as fixed scale-8 strings identically.

---

### LEDGER-6 — New append-only LedgerEntry table (dual-ORM lockstep + migration)

**Type:** schema  ·  **Effort:** M  ·  **Depends on:** LEDGER-5

Add a NEW append-only LedgerEntry table (one clean chain per org), not columns on the three mutable tables. THREE coordinated edits are mandatory: (1) prisma/schema.prisma model; (2) a new prisma/migrations/<ts>_add_ledger_entry/migration.sql applied manually via `npx prisma migrate deploy` (package.json build is only prisma generate && next build — migrations are NOT in CI); (3) a matching class LedgerEntry(Base) in database/models.py, using the metadata_ = Column('metadata', JSON) alias trick (collision with Base.metadata, see models.py:77,90,133) for any JSON column and BigInteger for sequence. Miss edit (3) and the FastAPI plane silently writes NULL hashes. Columns (server-assigned only): id (uuid PK); organizationId (chain partition); sequence BIGINT (per-org monotonic, genesis=0 — net-new, no bigserial exists today); actorAgentId (JWT sub); authorizerId (kill-switch pausedBy/actorId, null for autonomous); policyId/policyVersion (sentinel IMPLICIT_BUDGET_KILLSWITCH_v1 for v1); verdict enum ALLOWED|CAPPED|BLOCKED|REROUTED; enforcedBeforeCall BOOLEAN + enforcementProof JSON ({estimatedCost, agentReserved, orgReserved, reservationRowcount, killSwitchState}); estimatedCost DECIMAL(18,8), cost DECIMAL(18,8); provider, model, tokensIn, tokensOut; recordedAt (the single canonical timestamp from LEDGER-5); prevHash (hex SHA-256, genesis = 64 zeros); recordHash; signature (Ed25519 over recordHash, base64); signingKeyId; merklePeriodId/merkleLeafIndex (kept in a side mapping, see LEDGER-11, NOT back-stamped); sourceRefs JSON (ids of the satellite SpendLog/RequestLog rows). Constraints: @@unique([organizationId, sequence]); @@index([organizationId, recordedAt]); @@index([merklePeriodId]).

**Acceptance criteria:**
- prisma/schema.prisma defines LedgerEntry with all listed columns, the verdict enum, @@unique([organizationId, sequence]), and the two indexes.
- A new prisma/migrations/<ts>_add_ledger_entry/migration.sql creates the table + constraints and applies cleanly via npx prisma migrate deploy against a Postgres DB.
- database/models.py defines class LedgerEntry(Base) with identical column names, BigInteger sequence, DECIMAL(18,8) cost/estimatedCost, and JSON columns using the Column('metadata'/'enforcementProof'/'sourceRefs', JSON) alias pattern so SQLAlchemy populates them.
- Inserting a row via the SQLAlchemy model and reading it via Prisma (and vice versa) yields identical non-null field values (no silent NULLs).

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/prisma/schema.prisma
- /Users/mohitdhurve/Movies/whoai-platform/prisma/migrations/20260620000000_add_ledger_entry/migration.sql
- /Users/mohitdhurve/Movies/whoai-platform/database/models.py

**Test plan:**
- Migration test: run npx prisma migrate deploy on a fresh test DB; assert the LedgerEntry table, unique constraint, and indexes exist (information_schema query).
- Dual-ORM parity test: insert a LedgerEntry via SQLAlchemy with every column populated; fetch via Prisma client and assert all columns round-trip (catches a missing/misaliased column in models.py).
- Constraint test: two inserts with the same (organizationId, sequence) -> second fails with a unique violation.

---

### LEDGER-7 — Concurrency-safe chain-head allocation + chained append at the enforcement boundary

**Type:** backend  ·  **Effort:** L  ·  **Depends on:** LEDGER-3, LEDGER-6, LEDGER-8

Implement append_ledger_entry(session, ...) and wire it into the single per-outcome serialization points from LEDGER-3. Reuse the atomic-SQL discipline already proven in budget_service.py:26-66. At the append point: take pg_advisory_xact_lock(hashtext(:organizationId)) -> SELECT sequence, recordHash FROM "LedgerEntry" WHERE organizationId=:org ORDER BY sequence DESC LIMIT 1 FOR UPDATE -> compute next sequence/prevHash, build canonical bytes (LEDGER-5), compute recordHash, sign (LEDGER-8), INSERT — all inside the SAME transaction as the enforcement-decision commit (the request db, or for streaming the synchronous pre-call point per LEDGER-3, never the detached tail). Lock releases on commit. Map verdicts from the real lifecycle: success->ALLOWED; agent/org budget pre-reservation fail (gateway.py:304,314)->BLOCKED; kill-switch block (gateway.py:283,291)->BLOCKED; fallback used (gateway.py:327)->REROUTED; BYOK-missing/provider-error->BLOCKED. Populate enforcementProof from the pre_reserve_* rowcount + check_*_state results. FAIL-CLOSED on an ALLOWED request if the append fails (release the reservation via gateway.py:380-381 and return 503); FAIL-SAFE on a BLOCKED request (still block, best-effort append, alert).

**Acceptance criteria:**
- Every request outcome writes exactly one LedgerEntry with sequence = prior+1, prevHash = prior recordHash (genesis: sequence 0, prevHash 64 zeros), recordHash matching the canonical recompute, and a valid signature.
- N concurrent same-org requests produce a gap-free, fork-free chain (sequences 0..N-1, each prevHash == prior recordHash); a request killed mid-flight leaves no half-written link (rollback).
- Verdict mapping is correct for all 7 outcomes; enforcedBeforeCall=true and enforcementProof captures estimatedCost + reservation rowcounts + kill-switch state for enforced requests.
- An ALLOWED request whose ledger append throws returns 5xx and releases the budget reservation; a BLOCKED request still blocks even if the append fails.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/ledger_service.py
- /Users/mohitdhurve/Movies/whoai-platform/runtime/routers/gateway.py

**Test plan:**
- Concurrency test: fire N=50 concurrent same-org requests against a test gateway; assert sequences are contiguous 0..N-1 with no gaps/duplicates and each prevHash links correctly.
- Verdict test: drive each of ALLOWED/BLOCKED(budget)/BLOCKED(killswitch)/REROUTED/BLOCKED(BYOK)/BLOCKED(provider-error) and assert the recorded verdict + enforcementProof.
- Fail-closed test: stub the signer/append to throw on an ALLOWED request; assert 5xx and that release_agent_budget/release_org_budget were called.
- Rollback test: inject an exception after INSERT but before commit; assert no LedgerEntry persists and the advisory lock is released.
- Recompute test: for a written row, externally recompute recordHash from the canonical body+prevHash+sequence and assert equality.

---

### LEDGER-8 — Ed25519 signing with published-key + rotation registry (defer KMS custody)

**Type:** backend  ·  **Effort:** M  ·  **Depends on:** LEDGER-5

Asymmetric signing is mandatory: HS256 GATEWAY_SECRET and AES ENCRYPTION_KEY are symmetric/shared and cannot support trust-no-WHOAI verification. Use Ed25519 via cryptography==49.0.0 (already a dep — verified in requirements.txt:22; Node crypto verifies Ed25519 too) — zero new deps. MVP custody: an env-held private key LEDGER_SIGNING_PRIVATE_KEY (PEM) on the Render/Python plane only (the single surviving plane after LEDGER-1); document it in .env.example alongside the existing GATEWAY_SECRET/ENCRYPTION_KEY/CRON_SECRET entries. Graft-now audit-grade: ship signingKeyId + an append-only key registry (signingKeyId -> publicKey -> validFrom/validUntil/status) from day one so a later KMS migration changes only where the private key lives, not any issued proof; old public keys are never deleted. Fail-fast at boot if the signing key is unreadable (mirror the GATEWAY_SECRET guard at gateway.py:61). Sign over the recordHash; sign Merkle roots too (LEDGER-10).

**Acceptance criteria:**
- A record signed by key v1 verifies against the published v1 public key; after rotation to v2, both v1-signed and v2-signed records verify against their respective registry keys.
- Each LedgerEntry carries a non-null signingKeyId; the key registry maps it to a public key + validFrom/validUntil/status, and old public keys are retained.
- The Python plane fails to boot (clear error) if LEDGER_SIGNING_PRIVATE_KEY is missing/unreadable, mirroring the gateway.py:61 GATEWAY_SECRET guard.
- .env.example documents LEDGER_SIGNING_PRIVATE_KEY and the key-id convention; no new pip/npm dependency is introduced.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/signing.py
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/key_registry.py
- /Users/mohitdhurve/Movies/whoai-platform/runtime/main.py
- /Users/mohitdhurve/Movies/whoai-platform/.env.example

**Test plan:**
- Sign/verify round-trip in Python and independent verify in Node crypto against the same public key (cross-stack).
- Rotation test: sign with v1, rotate to v2, sign again; verify both against the registry; assert v1 public key still present.
- Boot guard test: start the app without LEDGER_SIGNING_PRIVATE_KEY -> process exits with the documented error.
- Tamper test: flip one byte of recordHash -> signature verification fails.

---

### LEDGER-9 — DB-level append-only enforcement (WORM at the DB)

**Type:** infra  ·  **Effort:** M  ·  **Depends on:** LEDGER-6, LEDGER-7

Today LedgerEntry rows would be freely UPDATE/DELETE-able (no triggers, agent-delete previously cascaded — fixed in LEDGER-4). In the LEDGER-6 migration (or a follow-on migration), REVOKE UPDATE, DELETE, TRUNCATE ON "LedgerEntry" FROM the app role(s) (both ORM connection roles share the Supabase Postgres) and add a BEFORE UPDATE OR DELETE ON "LedgerEntry" trigger that RAISE EXCEPTION (defense in depth). To keep entries strictly immutable, store the leaf->period mapping in the LedgerPeriod/side mapping table (LEDGER-11) rather than back-stamping merklePeriodId/merkleLeafIndex onto sealed rows — avoids any post-insert UPDATE conflicting with WORM. Apply via npx prisma migrate deploy (manual; not in CI).

**Acceptance criteria:**
- An UPDATE or DELETE on any LedgerEntry row from the application DB role fails (permission denied and/or trigger exception).
- INSERT into LedgerEntry from the app role still succeeds (append-only, not read-only).
- The Merkle sealing job records leaf->root via the side mapping table and performs no UPDATE on LedgerEntry rows.
- TRUNCATE on LedgerEntry from the app role fails.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/prisma/migrations/20260620010000_ledger_worm/migration.sql

**Test plan:**
- DB test: as the app role, attempt UPDATE/DELETE/TRUNCATE on LedgerEntry -> all rejected; INSERT -> accepted.
- Trigger test: even if a role somehow has UPDATE/DELETE grants, the BEFORE trigger raises an exception.
- End-to-end: run the gateway append path (LEDGER-7) and the sealing job (LEDGER-10) and confirm both succeed without any UPDATE/DELETE on LedgerEntry.

---

### LEDGER-10 — Daily per-org Merkle-root rollup (RFC-6962 domain separation) + signed roots

**Type:** backend  ·  **Effort:** L  ·  **Depends on:** LEDGER-7, LEDGER-8, LEDGER-9

Add a CRON_SECRET-guarded, fail-closed-when-unset cron endpoint (precedent app/api/cron/reset-budgets/route.ts:20-25, registered in vercel.json with the existing crons), export const dynamic='force-dynamic'. Per org, per prior UTC day: gather entries firstSequence..lastSequence, build a Merkle tree with RFC-6962 domain separation (0x00-prefixed leaves over the entry recordHash, 0x01-prefixed internal nodes; documented duplicate-last rule for odd counts), compute the root, sign it Ed25519 (LEDGER-8), and write a MerkleRoot/LedgerPeriod row {organizationId, periodId, periodStart/End, firstSequence, lastSequence, leafCount, rootHash, rootSignature, signingKeyId, algorithm, status SEALED, anchorStatus PENDING}. Record leaf->root + leaf index in the side mapping (so no LedgerEntry UPDATE is needed — WORM-safe). Add MerkleRoot + the side-mapping table to BOTH schemas (prisma + database/models.py, lockstep). The seal computation lives in the Python/Render plane co-located with the writer; the cron trigger may live in Next (vercel.json) and call into the Python seal logic, or run as a Render task. Idempotent: re-running a day yields the same root and does not create duplicate period rows.

**Acceptance criteria:**
- For a day with K entries in an org, the job produces one SEALED MerkleRoot row with leafCount=K, correct first/last sequence, a rootHash reproducible by an independent RFC-6962 implementation, and a valid rootSignature.
- Leaf->root + leaf index is stored in the side mapping; no UPDATE is performed on any LedgerEntry row (WORM intact).
- Re-running the job for the same org/day is idempotent: identical rootHash, no duplicate MerkleRoot rows.
- The cron endpoint returns 401 when CRON_SECRET is unset or the Bearer token does not match, mirroring reset-budgets.
- MerkleRoot and the side-mapping table exist in BOTH prisma/schema.prisma and database/models.py.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/merkle.py
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/sealing.py
- /Users/mohitdhurve/Movies/whoai-platform/app/api/cron/seal-ledger/route.ts
- /Users/mohitdhurve/Movies/whoai-platform/vercel.json
- /Users/mohitdhurve/Movies/whoai-platform/prisma/schema.prisma
- /Users/mohitdhurve/Movies/whoai-platform/database/models.py
- /Users/mohitdhurve/Movies/whoai-platform/prisma/migrations/20260620020000_add_merkle_root/migration.sql

**Test plan:**
- Merkle unit test: known leaf set -> root matches an independent RFC-6962 reference (including the odd-count duplicate-last case and the single-leaf case).
- Idempotency test: run the seal twice for the same org/day; assert identical rootHash and exactly one MerkleRoot row.
- Inclusion-proof test: for each leaf, generate its proof and verify it recomputes the stored root.
- Auth test: call the cron endpoint with no/invalid CRON_SECRET -> 401; with valid -> 200.
- WORM test: confirm the seal job performs zero UPDATE/DELETE on LedgerEntry.

---

### LEDGER-11 — External RFC-3161 TSA anchor for sealed roots + AnchorReceipt store

**Type:** backend  ·  **Effort:** M  ·  **Depends on:** LEDGER-10

After a root is sealed (LEDGER-10), anchor rootHash to a free RFC-3161 TSA (e.g. freetsa.org / DigiCert) — constructible with the existing cryptography lib (no new dep) — and store the signed timestamp token in an AnchorReceipt row {merkleRootId, anchorType RFC3161_TSA, receiptBlob, externalRef, anchoredAt, status}. Add AnchorReceipt to BOTH schemas (lockstep). Failure semantics: FAIL-OPEN for the request path (a request is never blocked because the TSA is down — anchoring is post-hoc on already-sealed roots), but a root stuck PENDING past an SLA raises an Alert (reuse the existing Alert model). The chain + per-record signatures + per-root signature stand alone even when an anchor is temporarily missing; /verify reports anchor status honestly (sealed-only vs anchored). Wire the anchor step into the sealing cron (after sealing) or as a follow-on pass over anchorStatus=PENDING roots.

**Acceptance criteria:**
- A sealed root obtains a verifiable RFC-3161 TSA token whose embedded timestamp is >= the period end; the token is stored in AnchorReceipt with externalRef and status=ANCHORED.
- Editing a sealed period's entries in the DB is detectable: recomputing the root no longer matches the rootHash whose token was TSA-anchored.
- TSA outage does not block or 5xx any LLM request; roots remain SEALED/PENDING and an Alert is raised once a PENDING root exceeds the SLA.
- AnchorReceipt exists in BOTH prisma/schema.prisma and database/models.py.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/anchor.py
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/sealing.py
- /Users/mohitdhurve/Movies/whoai-platform/prisma/schema.prisma
- /Users/mohitdhurve/Movies/whoai-platform/database/models.py
- /Users/mohitdhurve/Movies/whoai-platform/prisma/migrations/20260620030000_add_anchor_receipt/migration.sql

**Test plan:**
- TSA round-trip test (mocked TSA in CI, real TSA in a manual/integration run): build the RFC-3161 request for a rootHash, parse the response token, verify its signature and that timestamp >= period end.
- Tamper-detection test: anchor a root, then mutate an underlying entry in a copy, recompute -> root differs from the anchored value.
- Fail-open test: simulate TSA timeout during sealing; assert request path unaffected and the root stays PENDING.
- Alert test: a PENDING root older than the SLA produces exactly one Alert row.

---

### LEDGER-12 — Publish the verification public-key endpoint

**Type:** api  ·  **Effort:** S  ·  **Depends on:** LEDGER-8

Add a static, cacheable Next route serving all signing-key versions so /verify and external auditors can fetch the public keys without trusting WHOAI's runtime. Serve from app/api/ledger/public-key/route.ts (or a .well-known/whoai-ledger-keys.json equivalent), returning each keyId with publicKey, notBefore (validFrom), notAfter (validUntil), and status, sourced from the LEDGER-8 key registry. The private key is never exposed. export const dynamic='force-dynamic' (or appropriate caching headers).

**Acceptance criteria:**
- GET /api/ledger/public-key returns a JSON document listing every key version with keyId, publicKey (PEM or base64), notBefore, notAfter, status.
- No private key material is ever returned by this endpoint.
- A record's signature verifies using only the public key fetched from this endpoint (no DB access).
- Rotated/retired keys still appear (status reflects retirement) so historical proofs remain verifiable.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/app/api/ledger/public-key/route.ts

**Test plan:**
- Endpoint test: GET returns all registry keys; assert no field named privateKey/PEM-private is present.
- Verify-with-published-key test: sign a record (LEDGER-8), fetch the public key from this endpoint, verify the signature using only the fetched key.
- Rotation test: after rotation, both v1 and v2 appear with correct status/validity windows.

---

### LEDGER-13 — Authenticated org-scoped audit-log EXPORT (JSON/CSV, self-verifiable)

**Type:** api  ·  **Effort:** M  ·  **Depends on:** LEDGER-7, LEDGER-10, LEDGER-11

Add app/api/ledger/export/route.ts, export const dynamic='force-dynamic'. Auth via the canonical getServerAuthContext() (lib/server/auth.ts:10) — the if(!auth) 401; scope by auth.organizationId pattern used by ~25 routes (e.g. app/api/usage/requests/route.ts). Reuse parseUsageFilters (lib/analytics/filters.ts: from/to/agentId/model/provider, 366-day cap). Tier-gate to Pro (README ties export to Pro) via organization.subscriptionTier + lib/subscription.ts, mirroring the gating style in app/api/agents/route.ts. Output must be self-verifiable OFFLINE: each record carries sequence, prevHash, recordHash, signature, signingKeyId, its Merkle inclusion proof (sibling hashes + leaf index), the period rootHash/rootSignature, and the AnchorReceipt externalRef. CSV via raw new Response(csv, { headers: { 'Content-Type':'text/csv', 'Content-Disposition':'attachment; filename=...' }}) (Next 16 Non-UI pattern); JSON via NextResponse.json. The export reads LedgerEntry + the side mapping + MerkleRoot + AnchorReceipt (all readable from Next since both ORMs share one Postgres).

**Acceptance criteria:**
- GET /api/ledger/export with a valid session returns only that org's LedgerEntry records (scoped by auth.organizationId), in JSON or CSV per a format param.
- An unauthenticated request returns 401; a non-Pro org returns the documented tier-gate error/status.
- Each exported record includes sequence, prevHash, recordHash, signature, signingKeyId, Merkle inclusion proof, period rootHash/rootSignature, and anchor externalRef — sufficient to verify offline.
- parseUsageFilters bounds (366-day cap, date validity) are enforced; invalid filters return the standard error.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/app/api/ledger/export/route.ts
- /Users/mohitdhurve/Movies/whoai-platform/lib/ledger/export-service.ts

**Test plan:**
- Auth/scoping test: org A's session cannot retrieve org B's records; unauthenticated -> 401.
- Tier-gate test: a FREE-tier org -> blocked; a Pro org -> allowed.
- Format test: JSON and CSV both returned with correct Content-Type/Content-Disposition; CSV columns include all proof fields.
- Self-verify test: feed the exported JSON straight into the LEDGER-15 reference verifier (no DB/credential) -> passes.
- Filter test: 367-day range -> 400; valid range -> filtered results.

---

### LEDGER-14 — PUBLIC /verify endpoint + page (proof-bundle in, verification math out)

**Type:** api  ·  **Effort:** L  ·  **Depends on:** LEDGER-12, LEDGER-13

Add a PUBLIC route app/api/verify/route.ts (no auth helper — /verify is already public: proxy.ts matcher excludes /api and /verify is not in PROTECTED_PREFIXES) with export const dynamic='force-dynamic', plus a public page app/verify/page.tsx. CRITICAL: avoid the existing IDOR anti-pattern (app/api/violations/route.ts and app/api/alerts/route.ts read organizationId from the query string and leak any org). /verify accepts a SUBMITTED export/proof bundle and returns ONLY verification math: recompute recordHash from canonical body + prevHash + sequence (LEDGER-5), check sequence contiguity and chain-linkage (prevHash == prior recordHash), verify Ed25519 signatures against the PUBLISHED public key (LEDGER-12), recompute the Merkle root from the leaves, validate inclusion proofs and the root signature, and check the anchor (TSA token timestamp). Return pass/fail + which check failed + root + anchor reference. It MAY fetch the non-sensitive public root/anchor by merklePeriodId, but NEVER returns raw spend rows scoped by a guessable org id.

**Acceptance criteria:**
- POST /api/verify with a valid bundle returns pass + the root + anchor reference; with a single flipped byte returns fail and names the failing check (hash/linkage/signature/merkle/anchor).
- The endpoint returns ZERO tenant data beyond what the caller submitted plus public root/anchor metadata; it cannot be used to enumerate another org's spend rows via a query-string organizationId (no IDOR).
- Signature verification uses only the published public-key endpoint, not server-trusted state.
- A public page at /verify renders and lets a human submit a bundle and see the result; the page is reachable unauthenticated (not blocked by proxy.ts).

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/app/api/verify/route.ts
- /Users/mohitdhurve/Movies/whoai-platform/app/verify/page.tsx
- /Users/mohitdhurve/Movies/whoai-platform/lib/ledger/verify.ts

**Test plan:**
- Happy-path test: submit a valid export bundle -> pass with root + anchor ref.
- Tamper tests: flip a byte in a record body, break sequence contiguity, corrupt a signature, swap a Merkle sibling -> each returns fail naming the correct failing check.
- IDOR test: attempt to pass organizationId in the query/body to fetch raw rows -> endpoint never returns spend rows; only public root/anchor metadata.
- Public-access test: GET /verify (page) unauthenticated returns the page (not a redirect/401).
- Cross-stack test: verification result matches the LEDGER-15 standalone verifier for the same bundle.

---

### LEDGER-15 — Standalone reference verifier (TS + Python) so auditors need not trust the hosted endpoint

**Type:** test  ·  **Effort:** M  ·  **Depends on:** LEDGER-14

Ship a small standalone reference verifier in the repo (a TS script and a Python script) that, given only an exported bundle + the published public key + the public TSA receipt, performs the full verification (canonical recompute, chain linkage, signature, Merkle inclusion, root signature, anchor timestamp) with no WHOAI DB or credential access. This is the trust-no-WHOAI artifact and doubles as the cross-check oracle for LEDGER-14. Reuse the canonical encoders (LEDGER-5) and the verify logic (lib/ledger/verify.ts) where possible.

**Acceptance criteria:**
- Both the TS and Python verifiers, run offline against a real export + published public key + TSA receipt, output PASS for a valid bundle and FAIL (naming the failing check) for a tampered one.
- Neither verifier reads the WHOAI database or requires any WHOAI credential; inputs are only the bundle + public key + TSA receipt files.
- The two verifiers agree with each other and with the hosted /verify (LEDGER-14) on the same fixtures.
- A README documents how an external auditor runs the verifier.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/scripts/verify-ledger.ts
- /Users/mohitdhurve/Movies/whoai-platform/scripts/verify_ledger.py
- /Users/mohitdhurve/Movies/whoai-platform/docs/ledger-verify-runbook.md

**Test plan:**
- Offline pass test: feed a valid exported bundle + public key + TSA receipt to both scripts -> PASS, with no network call to WHOAI DB.
- Offline fail test: single-flipped-byte bundle -> FAIL with the correct failing check in both scripts.
- Triple-agreement test: TS verifier, Python verifier, and hosted /verify produce identical pass/fail + failing-check on a shared fixture set.

---

### LEDGER-16 — Genesis attestation, rollout runbook, reconciliation, and trust-page copy

**Type:** docs  ·  **Effort:** M  ·  **Depends on:** LEDGER-7, LEDGER-10, LEDGER-11, LEDGER-14

Each org's chain starts at sequence=0 with prevHash = 64 zero hex chars, recording chain-start time + active signingKeyId. NO retro-chaining of historical mutable rows (their integrity was never guaranteed); instead emit one signed+anchored genesis attestation per org recording the pre-ledger high-water mark, then chain forward. Disclose plainly (app/trust/page.tsx and docs) that verifiable history begins at activation T0; upgrade marketing copy from 'roadmap' to 'live' only after /verify is externally verifiable. Add the daily reconciliation script (declared in design T-1.0.5): sum ledger.cost per org/day vs UsageMetrics and flag drift, since after LEDGER-1 only the canonical path mutates counters. Author the rollout runbook enforcing the hard dependency order and the lockstep migrate-deploy + database/models.py edits in the same release, with Path B flipped off simultaneously and gateway startup gated on schema presence (or it writes NULLs).

**Acceptance criteria:**
- Activating an org emits exactly one genesis LedgerEntry (sequence=0, prevHash=64 zeros) plus a signed+anchored genesis attestation of the pre-ledger high-water mark.
- app/trust/page.tsx and docs state that verifiable history begins at activation T0 and do not claim historical rows are tamper-evident.
- The reconciliation script reports per-org/day drift between summed ledger.cost and UsageMetrics and exits non-zero (or alerts) when drift exceeds a documented tolerance.
- A rollout runbook documents the dependency order, the lockstep prisma migrate deploy + database/models.py edit, the Path-B flip-off, and the startup schema gate.

**Files to touch:**
- /Users/mohitdhurve/Movies/whoai-platform/runtime/ledger/genesis.py
- /Users/mohitdhurve/Movies/whoai-platform/scripts/reconcile-ledger.ts
- /Users/mohitdhurve/Movies/whoai-platform/app/trust/page.tsx
- /Users/mohitdhurve/Movies/whoai-platform/docs/ledger-rollout-runbook.md

**Test plan:**
- Genesis test: activate a fresh org -> exactly one sequence=0 entry with prevHash all zeros + a genesis attestation that verifies.
- Reconciliation test: seed a deliberate drift between LedgerEntry.cost sums and UsageMetrics -> script flags it; no drift -> clean exit.
- Copy test: trust page text asserts T0-onward verifiability and is not published as 'live' until /verify (LEDGER-14) passes external verification.
- Runbook dry-run: follow the runbook on a staging DB; assert no un-ledgered writes slip in during the Path-B flip and the gateway refuses to start if the LedgerEntry table is absent.

---

## Recommended sequencing

1. STRICT GATE FIRST (must land before any chaining): LEDGER-1 (collapse to one path) is the hard prerequisite; LEDGER-2 (bind actor) and LEDGER-3 (single serialization point) follow it. LEDGER-4 (stop append-only violations / soft-delete) has no dependencies and can run in parallel with LEDGER-1..3.
1. PARALLELIZABLE GRAFT-NOW FOUNDATIONS (can start immediately, independent of the 1.0 gate): LEDGER-5 (canonical serialization + golden vectors) and LEDGER-8 (Ed25519 signing + key registry) have no dependency on the path collapse and should be built in parallel by a crypto/serialization-focused engineer while another engineer does LEDGER-1..4.
1. SCHEMA: LEDGER-6 (LedgerEntry table, dual-ORM) depends on LEDGER-5 (needs the canonical column/format decisions) and can proceed once LEDGER-5 is stable, in parallel with the 1.0 gate work.
1. WRITE PATH: LEDGER-7 (chained append at the enforcement boundary) is the convergence point — it needs LEDGER-3 (single serialization point), LEDGER-6 (table), and LEDGER-8 (signing). This is the critical-path ticket; schedule it right after those three are done.
1. DB WORM: LEDGER-9 lands AFTER LEDGER-7 is verified (so writers are confirmed working before locking the table down), reusing the LEDGER-6 migration mechanics.
1. SEAL + ANCHOR: LEDGER-10 (Merkle rollup) -> LEDGER-11 (TSA anchor) are sequential and depend on LEDGER-7/8/9; LEDGER-12 (publish public key) depends only on LEDGER-8 and can be built in parallel with LEDGER-10/11.
1. READ SIDE: LEDGER-13 (export) depends on LEDGER-7/10/11 (needs records + proofs + anchors); LEDGER-14 (public /verify) depends on LEDGER-12 + LEDGER-13; LEDGER-15 (standalone verifier) depends on LEDGER-14 and reuses its verify logic.
1. FINALIZE: LEDGER-16 (genesis + runbook + reconciliation + trust-page copy) lands last, after the chain, seal, anchor, and verify are all working; the trust-page copy flip is explicitly gated on LEDGER-14 being externally verifiable.
1. Recommended two-track build: Track A (engineer 1) = LEDGER-1 -> LEDGER-2 -> LEDGER-3 then LEDGER-7 -> LEDGER-9 -> LEDGER-10 -> LEDGER-11. Track B (engineer 2) = LEDGER-5 + LEDGER-8 (parallel) -> LEDGER-6 -> LEDGER-12 -> LEDGER-13 -> LEDGER-14 -> LEDGER-15. LEDGER-4 slots in early on either track; LEDGER-16 is a joint final step. The two tracks converge at LEDGER-7.

## Open questions

- Where should the daily seal+anchor job actually RUN? The cron trigger pattern lives in Next (vercel.json, CRON_SECRET), but the Merkle/sign/anchor logic must be co-located with the Python writer on Render. Options: (a) Vercel cron calls a CRON_SECRET-guarded FastAPI endpoint; (b) a native Render cron/worker. Also note the repo has BOTH vercel.json and netlify.toml (competing Next deploy configs) — which is the real deploy target must be confirmed before registering the cron.
- LEDGER-9 (DB-level REVOKE) requires a dedicated, lower-privilege application DB role on Supabase that lacks UPDATE/DELETE/TRUNCATE on LedgerEntry. Today both ORMs likely connect as the same broad role via DATABASE_URL/DIRECT_URL. Confirm whether a separate least-privilege role can be provisioned on the shared Supabase Postgres, or whether the BEFORE UPDATE/DELETE trigger must carry the WORM guarantee alone.
- The CAPPED verdict has no live producer: the current lifecycle only blocks (BLOCKED) or allows (ALLOWED) on the pre-reservation rowcount — there is no partial-cap/clamp behavior in budget_service.py. Confirm CAPPED stays a reserved-but-unused enum value for v1, or define what would produce it.
- estimateTokens/cost estimation differs between the surviving Python path (_estimate_request_cost: in=payload/4, out=2x in) and the retired TS path. enforcementProof.estimatedCost will come from the Python estimator only — confirm that's acceptable as the single recorded estimate.
- RFC-3161 TSA choice and reliability: freetsa.org / DigiCert are free but have no SLA. Confirm the acceptable PENDING-anchor SLA before raising Alerts, and whether a paid TSA is needed for production assurance (a second/independent anchor is explicitly out of scope for 1.1).
- Pro-tier gating for export (LEDGER-13): README ties export to Pro, but Organization has both `tier` (OrgTier enum) and `subscriptionTier` (String) fields. Confirm which field is authoritative for the entitlement check and how lib/subscription.ts maps it.
- Authorizer attribution for normal autonomous requests: the design records authorizerId from kill-switch pausedBy/actorId where present, else null. Confirm there is no requirement to thread a human authorizer through normal (non-paused) agent requests in Phase 1.1.
- Migration ordering vs WORM: LEDGER-6 creates the table and LEDGER-9 locks it down in a later migration. Confirm the operational sequencing (create+write+verify, THEN REVOKE/trigger) is acceptable, since applying WORM before writers are validated would block LEDGER-7 testing.

## Full ledger design (reference)

## Phase 1.1 — Tamper-Evident Enforcement Ledger + Public Verify (RECOMMENDED, synthesized)

Posture: **MVP spine that ships in ~1 quarter, with the audit-grade choices that are cheap-now / impossible-to-retrofit grafted in from day one.** The three things you must get right at the start because changing them later breaks every previously-issued proof are: (1) the **chain/record canonical format**, (2) the **signing-key trust model (asymmetric + published)**, and (3) the **public /verify contract**. Everything else (KMS custody, WORM object-lock, second anchor, Policy-DSL, RBAC, retro-chaining) is deferrable without invalidating already-emitted proofs. All paths absolute; every claim grounded in the verified tree.

Canonical-path decision (settles the open ambiguity): **FastAPI Path A (`/Users/mohitdhurve/Movies/whoai-platform/runtime/routers/gateway.py:233-234`) is canonical.** It is the only path with a true atomic pre-call reservation (`/Users/mohitdhurve/Movies/whoai-platform/runtime/budget/budget_service.py:26-66`, called at `gateway.py:303,313`) — the literal "limit enforced BEFORE the call" proof — it persists verdicts via `log_activity`/kill-switch, and it is the README/`render.yaml`-documented data plane. Path B (`/Users/mohitdhurve/Movies/whoai-platform/app/api/v1/chat/completions/route.ts`) is race-prone (TOCTOU in `/Users/mohitdhurve/Movies/whoai-platform/lib/services/PolicyEngine.ts:36-43`), persists no verdict, and swallows accounting writes (`route.ts:138-172`). Keep A, retire B.

---

### PART A — PHASE 1.0 PREREQUISITE (hard gate; nothing below is correct until this lands)

A per-org monotonic hash chain (sequence + prevHash) **requires one serialized writer**. Two uncoordinated writers fork the chain. 1.0 must ship first.

**T-1.0.1 — Collapse to one canonical enforcing path.**
Make `gateway.py` the sole path that enforces budget/kill-switch AND writes the ledgered tables. Reduce `app/api/v1/chat/completions/route.ts` POST to a thin reverse-proxy to the Render FastAPI origin (mint the agent JWT server-side from the org ApiKey + a server-resolved agentId) — recommended first step so the customer-facing Vercel URL keeps working — then later a hard 410. Either way, remove its parallel writes (`SpendEngine.recordSpend`, `UsageEngine.updateUsage`, `prisma.requestLog.create` at `route.ts:139-167`); `lib/gateway/adapters/*`, `lib/spend-engine`, `lib/usage-engine` request-path use become dead. Re-point public docs (`/Users/mohitdhurve/Movies/whoai-platform/app/docs/page.tsx:14`, `/Users/mohitdhurve/Movies/whoai-platform/app/docs/quickstart/page.tsx:78`).
*Acceptance:* an integration test fails CI if a POST to the Vercel path produces a SpendLog/RequestLog/ActivityLog row, or if any `spendLog.create`/`requestLog.create`/`SpendEngine`/`UsageEngine` call exists on a request path under `app/`.

**T-1.0.2 — Bind actor identity to the credential.**
The ledger's `actor` field is only worth signing if it's not attacker-supplied. After 1.0.1, Path A's JWT `sub`(agentId)/`org`(orgId) (verified `gateway.py:246-248`) are already credential-bound — the proxy must resolve agentId from a credential the caller cannot forge, never trust the `x-agent-id` header (`route.ts:71`). Record the caller-supplied `fallback` provider (`gateway.py:262,327`) verbatim but as a `REROUTED` verdict flagged caller-influenced; do not let it widen trust.
*Acceptance:* every ledger record's `actorAgentId`/`organizationId` derive only from JWT claims.

**T-1.0.3 — One synchronous, transactional serialization point.**
Today telemetry commits at 6+ sites across two sessions: the request session `db` (non-stream success commit at `gateway.py:374`; block/budget commits at :284,:292,:307,:319,:382,:396) and a **detached `async_session_maker()` inside `_save_telemetry` for streaming** (commit at `gateway.py:215`, dispatched fire-and-forget at `gateway.py:219`). Introduce one `append_ledger_entry(session, ...)` call as the last write before each terminal commit, on whichever session owns that commit. **Critical insight for streaming:** the enforcement verdict + reservation is fully known *before* the stream starts (`gateway.py:301-323`), so the ledger row (verdict, estimatedCost, `enforcedBeforeCall=true`) is appended **synchronously at the enforcement boundary**, not in the detached tail. The detached `_save_telemetry` only later reconciles actual cost into the satellite SpendLog row (or a follow-on `RECONCILED` event), never mutating the sealed ledger row.
*Acceptance:* every outcome (completed, blocked, budget-exceeded, BYOK-missing, provider-error, streamed-completed) yields exactly one ledger entry, appended at one location per outcome, committed in the same transaction as the enforcement decision.

**T-1.0.4 — Stop append-only violations.**
`/Users/mohitdhurve/Movies/whoai-platform/app/api/agents/[id]/route.ts:132-139` hard-deletes requestLog/usageMetrics/spendLog in a `$transaction` on agent delete — incompatible with WORM. Switch to soft-delete/tombstone (mark agent TERMINATED, retain rows; record the deletion as its own ledger entry with actor = deleting user) and never touch the ledger table. `/Users/mohitdhurve/Movies/whoai-platform/scripts/seed-dashboard.ts` uses `prisma.createMany` bulk inserts — gate to non-prod and keep it out of the ledger table. Confirm `/Users/mohitdhurve/Movies/whoai-platform/app/api/cron/reset-budgets/route.ts` only mutates counters (fine — counters are the fast cache, not the ledger).

**T-1.0.5 — Reconcile spend source-of-truth.** Declare the ledger the system of record for verdict + enforcement-proof + authoritative cost; the denormalized `currentDailySpend` counters (reset by `reset-budgets` cron) remain the fast enforcement cache. After 1.0.1 only Path A mutates counters, ending the cross-write drift. Ship a daily reconciliation script (sum ledger.cost per org/day vs UsageMetrics, flag drift).

---

### PART B — PHASE 1.1 LEDGER

**T-1.1.1 — Canonical cross-language serialization contract (graft audit-grade now — irreversible).**
Define ONE byte-exact serialization reproducible by Python (writer), TS (export/verify), and any external auditor. Spec: UTF-8 JSON, lexicographically sorted keys (RFC 8785 / JCS style), camelCase keys matching DB columns, no insignificant whitespace, RFC-3339 UTC timestamp at millisecond precision (single server-assigned field — resolves the today-ambiguity of dual `timestamp`+`createdAt` and naive-UTC vs `CURRENT_TIMESTAMP`), **cost rendered as fixed-scale decimal string at scale 8 — never a float** (floats are non-reproducible across Python/JS; SpendLog.cost is already `Numeric(18,8)` per `database/models.py:75`), null fields omitted by a fixed documented rule. `recordHash = SHA-256(canonical(body_without_hash_sig_fields) || prevHash || sequence)`. SHA-256 exists in both runtimes (`hashlib` / Node `crypto`) — zero new deps.
*Acceptance:* a golden-vector test yields identical bytes and identical SHA-256 from the Python writer and a TS recompute.

**T-1.1.2 — New append-only `LedgerEntry` table (dual-ORM, lockstep) — the single record binding everything.**
A NEW table, not columns bolted onto three mutable tables, gives one clean chain per org. **Three coordinated edits are mandatory** (verified dual-ORM rule): (1) `/Users/mohitdhurve/Movies/whoai-platform/prisma/schema.prisma` model; (2) `prisma/migrations/<ts>_add_ledger_entry/migration.sql` applied **manually via `npx prisma migrate deploy`** (not in CI — `package.json` build is only `prisma generate && next build`); (3) matching `class LedgerEntry(Base)` in `/Users/mohitdhurve/Movies/whoai-platform/database/models.py`, with any JSON column using the `metadata_ = Column("metadata", JSON)` alias trick (collision with `Base.metadata`, see `models.py:77,90,133`) and `BigInteger` for `sequence`. Miss edit (3) and the FastAPI plane silently writes NULL hashes.

Columns (server-assigned only): `id` (uuid surrogate); `organizationId` (chain partition); `sequence BIGINT` (per-org monotonic, genesis=0 — net-new, no bigserial exists today); `actorAgentId` (JWT sub); `authorizerId` (human/system from kill-switch `pausedBy`/`actorId`, null for autonomous calls); `policyId`/`policyVersion` (record sentinel `IMPLICIT_BUDGET_KILLSWITCH_v1` for v1 — `Policy.ruleDsl` is dormant); `verdict` enum **ALLOWED | CAPPED | BLOCKED | REROUTED** (success→ALLOWED; budget pre-reservation fail at `gateway.py:304,314`→BLOCKED; kill-switch block at `gateway.py:283,291`→BLOCKED; fallback used at `gateway.py:327`→REROUTED; BYOK-missing/provider-error→BLOCKED); `enforcedBeforeCall BOOLEAN` + `enforcementProof JSON` (`{estimatedCost, agentReserved, orgReserved, reservationRowcount, killSwitchState}` from the `pre_reserve_*` rowcount and `check_*_state` — the field that makes "enforced before the call" attestable); `estimatedCost DECIMAL(18,8)`, `cost DECIMAL(18,8)`; `provider`, `model`, `tokensIn`, `tokensOut`; `recordedAt` (the single canonical timestamp from T-1.1.1); `prevHash` (hex SHA-256 of prior entry's hash; genesis = 64 zeros); `recordHash`; `signature` (Ed25519 over recordHash, base64); `signingKeyId` (rotation); `merklePeriodId`/`merkleLeafIndex` (null until sealed); `sourceRefs JSON` (ids of the satellite SpendLog/RequestLog rows this attests). Constraints: **`@@unique([organizationId, sequence])`** (prevents forks; net-new), `@@index([organizationId, recordedAt])`, `@@index([merklePeriodId])`.

**T-1.1.3 — Concurrency-safe per-org chain-head allocation.**
The codebase already solved the sibling race with atomic SQL (`budget_service.py:26-66`, conditional `UPDATE ... WHERE`); apply the same discipline. At the single append point, take `pg_advisory_xact_lock(hashtext(:organizationId))` → `SELECT sequence, recordHash FROM "LedgerEntry" WHERE organizationId=:org ORDER BY sequence DESC LIMIT 1 FOR UPDATE` → compute next sequence/prevHash/recordHash/signature → INSERT, **all inside the same transaction as the enforcement-decision commit** (the request `db`, or for streaming the synchronous pre-call point per T-1.0.3, not the detached tail). Lock releases on commit.
*Acceptance:* N concurrent same-org requests yield a gap-free, fork-free chain (sequences 0..N-1, each prevHash == prior recordHash); a killed mid-request leaves no half-written link (rollback).

**T-1.1.4 — Ed25519 signing with a published-key trust model (graft audit-grade key *format/rotation* now; defer KMS custody).**
Asymmetric is mandatory — HS256 `GATEWAY_SECRET` and AES `ENCRYPTION_KEY` are symmetric/shared and cannot support trust-no-WHOAI verification (anyone with the secret could forge). Use **Ed25519** via `cryptography==49.0.0` (already a dep — zero new deps; Node `crypto` verifies it). **MVP custody:** an env-held private key `LEDGER_SIGNING_PRIVATE_KEY` (PEM) on the Render/Python plane only (the single surviving plane after 1.0); document in `/Users/mohitdhurve/Movies/whoai-platform/.env.example`. **Audit-grade graft (cheap now):** ship the *key-id + rotation registry + published-public-key endpoint* from day one so migrating to KMS later changes only where the private key lives, not any issued proof. Each entry carries `signingKeyId`; an append-only registry maps `signingKeyId → publicKey → validFrom/validUntil`; old public keys are never deleted. Fail-fast at boot if the key is unreadable (mirror the `GATEWAY_SECRET` guard at `gateway.py:61`).
*Acceptance:* a record signed by key v1 verifies against the published v1 key; after rotation to v2, both old and new records verify.

**T-1.1.5 — Publish the verification public key.** Static cacheable endpoint `/Users/mohitdhurve/Movies/whoai-platform/app/api/ledger/public-key/route.ts` (or `.well-known/whoai-ledger-keys.json`) serving all key versions with `keyId`, `notBefore`, `notAfter`, `status`. /verify and external auditors fetch from here; private key never exposed.

**T-1.1.6 — DB-level append-only (WORM at the DB).**
Today rows are freely UPDATE/DELETE-able (no triggers; agent-delete cascades). In the migration: `REVOKE UPDATE, DELETE, TRUNCATE ON "LedgerEntry" FROM <app_role>` (both ORM connection roles share Supabase Postgres) + a `BEFORE UPDATE OR DELETE ON "LedgerEntry"` trigger that `RAISE EXCEPTION` (defense in depth). To keep entries strictly immutable, store the leaf→period mapping in the `LedgerPeriod`/side table rather than back-stamping `merklePeriodId` onto sealed rows — avoids any post-insert UPDATE conflicting with WORM.
*Acceptance:* an UPDATE/DELETE on a LedgerEntry from the app role fails; the sealing job still records leaf→root via the side mapping.

**T-1.1.7 — Daily Merkle-root rollup.**
Reuse the verified cron pattern: a `CRON_SECRET`-guarded, **fail-closed-when-unset** endpoint (precedent `app/api/cron/reset-budgets/route.ts:20`), registered in `/Users/mohitdhurve/Movies/whoai-platform/vercel.json`, `export const dynamic="force-dynamic"`. Per org, per prior UTC day: gather entries `firstSequence..lastSequence`, build a Merkle tree with **RFC-6962 domain separation** (`0x00`-prefixed leaves, `0x01`-prefixed nodes; documented duplicate-last rule for odd counts — unambiguous to an external verifier), compute root, sign it (Ed25519), write a `LedgerPeriod`/`MerkleRoot` row {organizationId, periodId, periodStart/End, firstSequence, lastSequence, leafCount, rootHash, rootSignature, signingKeyId, algorithm, status SEALED, anchorStatus PENDING}, and record leaf→root in the side mapping. Add `MerkleRoot` to BOTH schemas (lockstep). Seal logic in the Python/Render plane (co-located with the writer); idempotent re-run yields the same root.

**T-1.1.8 — External anchor (MVP: one free anchor; defer WORM/second anchor).**
After a root is sealed, anchor `rootHash` to a free **RFC-3161 TSA** (e.g. freetsa.org / DigiCert) — constructible with the existing `cryptography` lib, no new dep — and store the signed timestamp token in an `AnchorReceipt` row {merkleRootId, anchorType RFC3161_TSA, receiptBlob, externalRef, anchoredAt, status}. **Failure semantics: fail-open for the request path** (a request is never blocked because the TSA is down; anchoring is post-hoc on already-sealed roots), but a root stuck PENDING past SLA raises an Alert (reuse the Alert model). The chain + per-record signatures stand alone even when an anchor is temporarily missing; /verify reports anchor status honestly (sealed-only vs anchored).
*Acceptance:* a sealed root has a verifiable TSA token whose timestamp ≥ period end; editing a sealed period in the DB is detectable by recomputing the root and comparing to the anchored value.

**T-1.1.9 — Authenticated org-scoped EXPORT (JSON/CSV).**
New Next route `/Users/mohitdhurve/Movies/whoai-platform/app/api/ledger/export/route.ts`, `export const dynamic="force-dynamic"`. Auth via the canonical `getServerAuthContext()` (`/Users/mohitdhurve/Movies/whoai-platform/lib/server/auth.ts:10`) — the `if (!auth) 401; scope by auth.organizationId` pattern used by ~25 routes (e.g. `app/api/usage/requests/route.ts:7`). Reuse `parseUsageFilters` (`/Users/mohitdhurve/Movies/whoai-platform/lib/analytics/filters.ts`, from/to/agentId/model/provider, 366-day cap). Tier-gate to Pro (README ties export to Pro) via `organization.subscriptionTier` + `lib/subscription.ts`, mirroring `app/api/agents/route.ts:57-73`. **Output is self-verifiable offline:** each record carries `sequence, prevHash, recordHash, signature, signingKeyId`, its Merkle inclusion proof (sibling hashes), the period `rootHash`/`rootSignature`, and the AnchorReceipt external ref. CSV via raw `new Response(csv, { headers: { "Content-Type":"text/csv", "Content-Disposition":"attachment; filename=..." }})` (Next 16 Non-UI pattern).

**T-1.1.10 — PUBLIC /verify endpoint + page (graft the contract correctly now — irreversible if it leaks).**
New PUBLIC route `/Users/mohitdhurve/Movies/whoai-platform/app/api/verify/route.ts` (no auth helper; `/verify` is already public — `proxy.ts` matcher excludes `/api` and `/verify` is not in PROTECTED_PREFIXES), `export const dynamic="force-dynamic"`, plus a public page `/Users/mohitdhurve/Movies/whoai-platform/app/verify/page.tsx`. **Avoid the existing IDOR anti-pattern** (`/Users/mohitdhurve/Movies/whoai-platform/app/api/violations/route.ts` and `app/api/alerts/route.ts` read `organizationId` from the query string and leak any org). /verify accepts a **submitted export/proof bundle** and returns ONLY verification math: recompute recordHash from canonical body + prevHash, check sequence contiguity and chain-linkage (prevHash == prior recordHash), verify Ed25519 signatures against the **published** public key (T-1.1.5), recompute the Merkle root from leaves, validate inclusion proofs and the root signature, and check the anchor (TSA token timestamp). Returns pass/fail + which check failed + root + anchor reference. It may fetch the non-sensitive public root/anchor by `merklePeriodId`, but NEVER returns raw spend rows scoped by a guessable org id. Ship a standalone reference verifier script (small TS + Python) in the repo so an auditor need not trust even the hosted endpoint.
*Acceptance:* a third party with only the published public key + a downloaded export + the public TSA receipt can prove inclusion and detect a single flipped byte, without any WHOAI credential or DB access.

**T-1.1.11 — Genesis + backfill + rollout runbook.**
Genesis: each org's chain starts at `sequence=0`, `prevHash` = 64 zero hex chars, recording chain-start time + active `signingKeyId`. **No retro-chaining of historical mutable rows** (their integrity was never guaranteed — claiming otherwise is over-claiming). Instead emit one signed+anchored **genesis attestation** per org recording the pre-ledger high-water mark, then chain forward; disclose plainly (in `/Users/mohitdhurve/Movies/whoai-platform/app/trust/page.tsx` and docs) that verifiable history begins at activation T0. Rollout order (hard dependency): 1.0.1–1.0.5 → 1.1.1 (canonical format) → 1.1.2 (schema, lockstep, migrate deploy) → 1.1.3/1.1.4 (chain+sign at write) → 1.1.6 (DB WORM, after writers verified) → 1.1.7 (rollup) → 1.1.8 (anchor) → 1.1.5 (publish key) → 1.1.9 (export) → 1.1.10 (verify). Migrations are manual and require the lockstep `database/models.py` edit in the same release, with Path B flipped off simultaneously so no un-ledgered writes slip in; gate gateway startup on schema presence or it writes NULLs.

---

### FAILURE-MODE POSTURE (explicit, per MOAT "budget fails closed")
- **Ledger append fails on an ALLOWED request → FAIL CLOSED** (5xx, release the reservation via the existing `release_*` path at `gateway.py:380-381`). An un-ledgered allowed call defeats the moat. Safe only because T-1.0.3 makes the write synchronous/transactional — the opposite of today's swallow-all (`route.ts:138-172`).
- **Ledger append fails on a BLOCKED request → FAIL SAFE** (still block; best-effort append; alert).
- **Signing key unreadable → FAIL CLOSED for allows** (cannot prove enforcement ⇒ refuse), with a boot-time fast-fail guard.
- **Merkle rollup down → no request impact** (per-record chain+signatures are independent; unsealed days catch up idempotently).
- **Anchor (TSA) down → FAIL OPEN for requests, alert on the rollup** (post-hoc on sealed data; /verify reports "sealed, anchor pending" truthfully).
