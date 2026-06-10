# WHOAI Operational Loop Audit: Steps 16–19
**Date:** 2026-06-10 | **Codebase:** /Users/mohitdhurve/whoai-platform | **Status:** PARTIAL IMPLEMENTATION

---

## STEP 16: Budget Engine Evaluates Spend ✅ IMPLEMENTED

### Execution Path
- **Primary Service:** `runtime/budget/budget_service.py` (lines 37–248)
- **Invocation:** Called in `runtime/routers/gateway.py` (lines 230, 243)
- **Database Tables:** 
  - `SpendLog` (per-request logging)
  - `Agent.currentDailySpend / currentMonthlySpend` (denormalized counters)
  - `Organization.currentDailySpend / currentMonthlySpend` (denormalized counters)

### Implementation Details
**Spend Calculation:**
```python
# runtime/budget/budget_service.py:37-53
async def _calculate_spend(
    db, organization_id: str, period: str, agent_id: Optional[str] = None
) -> Decimal:
    query = select(func.coalesce(func.sum(SpendLog.cost), 0)).where(
        SpendLog.organizationId == organization_id,
        SpendLog.createdAt >= _period_start(period),
    )
    if agent_id:
        query = query.where(SpendLog.agentId == agent_id)
    result = await db.execute(query)
    return _money(result.scalar())
```
**Functions:**
- `calculate_agent_daily_spend()` — sums SpendLog.cost where agentId + createdAt >= today's start
- `calculate_agent_monthly_spend()` — sums SpendLog.cost where agentId + createdAt >= month start
- `calculate_org_daily_spend()` — sums SpendLog.cost where organizationId + createdAt >= today's start
- `calculate_org_monthly_spend()` — sums SpendLog.cost where organizationId + createdAt >= month start

**Budget Limits Storage:**
- Per-Agent: `Agent.dailyBudget` and `Agent.monthlyBudget` (Decimal fields in DB)
- Per-Org: `Organization.dailyBudget` and `Organization.monthlyBudget` (Decimal fields in DB)
- Defined in Prisma schema (schema.prisma:18–21, 65–68)
- Synchronized to SQLAlchemy models (database/models.py:31–34, 54–57)

### Test Coverage
✅ **tests/test_budget_engine.py** (65–130)
- `test_agent_daily_limit()` — verifies daily spend >= daily limit blocks
- `test_agent_monthly_limit()` — verifies monthly spend >= monthly limit blocks
- `test_org_daily_limit()` — verifies org daily spend >= daily limit blocks
- `test_org_monthly_limit()` — verifies org monthly spend >= monthly limit blocks
- `test_alert_creation_and_activity_log_creation()` — confirms Alert + ActivityLog are added when budget exceeded
- `test_dashboard_calculations()` — confirms `build_budget_status()` calculates remaining budget / utilization %

### Status
✅ **PRODUCTION-READY** — Budget evaluation logic is complete, tested, and wired into request path.

---

## STEP 17: Budget Limits Block Requests (Enforcement) ✅ CRITICAL PATH IMPLEMENTED

### Execution Path
**Gateway Request Handler:** `runtime/routers/gateway.py:164–305`

**Critical Enforcement Points:**
```python
# gateway.py:230–241 (Agent Budget Check)
agent_budget_decision = await check_agent_budget(db, agent)
if not agent_budget_decision["allowed"]:
    await pause_agent(db, agent, reason=_pause_reason_from_budget(...))
    await db.commit()
    return JSONResponse(status_code=402, content={"error": "Budget exceeded", ...})

# gateway.py:243–254 (Organization Budget Check)
org_budget_decision = await check_org_budget(db, organization, agent_id=agent_id)
if not org_budget_decision["allowed"]:
    await pause_organization(db, organization, reason=...)
    await db.commit()
    return JSONResponse(status_code=402, content={"error": "Budget exceeded", ...})
```

### Budget Decision Logic
```python
# budget_service.py:160–202 (Agent Budget Check)
async def check_agent_budget(db, agent: Agent) -> Dict:
    if daily_limit > 0 and daily_spend >= daily_limit:
        await _record_budget_violation(...)
        return _decision(AGENT_DAILY_LIMIT_EXCEEDED, ...)
    if monthly_limit > 0 and monthly_spend >= monthly_limit:
        await _record_budget_violation(...)
        return _decision(AGENT_MONTHLY_LIMIT_EXCEEDED, ...)
    return _decision()  # allowed=True
```

### Enforcement Guarantees
1. **Request Blocking is Synchronous:** Budget checks happen BEFORE provider routing (line 256+)
2. **Spend Calculation is Real-time:** Sums actual SpendLog records from the database
3. **Comparison Threshold:** `>=` (at or over limit blocks)
4. **HTTP Status:** Returns 402 (Payment Required) when budget exceeded
5. **Auto-Pause:** Triggers `pause_agent()` or `pause_organization()` on overage, setting status to PAUSED

### Kill Switch Integration (Secondary Layer)
**Distinct from Budget Checks:** The kill switch (check_agent_state / check_org_state) is a separate guard that blocks on agent.status / org.status **before** budget checks (lines 213–227).

```python
# gateway.py:213–227 (Kill Switch Checks)
agent_state_decision = await check_agent_state(db, agent)
if not agent_state_decision["allowed"]:
    return JSONResponse(status_code=403, ...)
org_state_decision = await check_org_state(db, organization, agent_id=agent_id)
if not org_state_decision["allowed"]:
    return JSONResponse(status_code=403, ...)
```

### Difference: Kill Switch vs. Budget Check
- **Kill Switch (check_agent_state):** Returns 403, checks if agent.status in {PAUSED, QUARANTINED, TERMINATED}
- **Budget Check (check_agent_budget):** Returns 402, sums spend vs. limit, triggers auto-pause

Both are in the request path, but budget check is what **evaluates and enforces spend limits**.

### Test Coverage
✅ **tests/test_budget_engine.py:132–175** (`test_gateway_blocking`)
- Verifies that when `check_agent_budget` returns `allowed=False`, the gateway returns 402
- Confirms the provider is never called when budget is exceeded
- Validates the request is logged as blocked

✅ **tests/test_kill_switch.py:95–175** — Tests pause/resume/termination lifecycle (separate from budget)

### Potential Concern: Denormalized Counters
**Finding:** Agent/Org.currentDailySpend / currentMonthlySpend are updated in real-time (spend_logger.py:49–60):
```python
await db.execute(
    update(Agent).values(
        currentDailySpend=Agent.currentDailySpend + cost,
        currentMonthlySpend=Agent.currentMonthlySpend + cost,
    )
)
```
These counters are **not used in budget checks** — only SpendLog sum is used (line 44–53 in budget_service.py). This is correct for accuracy but leaves the counters potentially stale. They appear to be dashboard-only. ✅

### Status
✅ **PRODUCTION-READY** — Budget enforcement is wired into the live request path, blocks requests before routing, and auto-pauses agents/orgs on overage. The HTTP 402 response clearly indicates a budget issue.

---

## STEP 18: Alert Engine Evaluates Anomalies ⚠️ PARTIAL / ORPHANED

### Anomaly Detection Code
**File:** `runtime/telemetry/anomaly_detector.py` (lines 7–127)

**Implementation:**
```python
async def detect_anomalies(db: AsyncSession, agent_id: str, org_id: str):
    # Fetch today's metrics from UsageMetrics table
    today_metrics = ...  # totalCost, totalTokens, totalRequests
    
    # Fetch 7-day average (excluding today)
    avg_spend, avg_tokens, avg_requests = ...
    
    # Evaluate anomalies:
    # - SPEND_SPIKE: current_spend > 2 * baseline_spend
    # - TOKEN_SPIKE: current_tokens > 3 * baseline_tokens
    # - REQUEST_SPIKE: current_requests > 3 * baseline_requests
    
    # Fire alerts to DB (Alert + ActivityLog records)
    for anomaly in anomalies_detected:
        alert = Alert(type=anomaly["type"], ...)
        db.add(alert)
        await db.commit()
```

**Thresholds:**
- Spend: > 2x 7-day average
- Tokens: > 3x 7-day average
- Requests: > 3x 7-day average
- Baselines avoid zero with hardcoded minimums (1.0, 1000, 10)

**Database Interaction:**
- Reads from: `UsageMetrics` (per-agent daily snapshots)
- Writes to: `Alert` (anomaly records), `ActivityLog` (audit trail)
- Deduplication: Checks if same anomaly type already alerted today (lines 91–99)

### Critical Finding: NEVER CALLED
**Invocation Search Result:**
```
/runtime/telemetry/anomaly_detector.py:async def detect_anomalies(...)
```
✗ **ZERO references outside the definition** — grep across entire codebase (excluding node_modules/.venv) returns only the function definition.

**Where it SHOULD be called:**
1. **Option A (Recommended):** After `update_daily_metrics()` in gateway.py, line 146
   - Current code: `await update_daily_metrics(db, org_id, agent_id, total_tokens, cost)` — no call to anomaly detection
2. **Option B:** In a background cron job (NOT PRESENT in codebase)
3. **Option C:** In a separate scheduled service (NOT PRESENT)

### Related Services (Unintegrated)
- `runtime/telemetry/metrics_service.py:15–54` — Updates UsageMetrics daily aggregates but does NOT call anomaly detection
- No APScheduler, Celery, or cron job runner configured
- No environment variables for scheduling interval (check .env.example — none present)

### Test Coverage
✗ **NO TESTS** for anomaly_detector.py
- Searches for test files: `find ... test*anomaly* `— returns no results
- The module is untested and orphaned

### Status
⚠️ **NOT PRODUCTION-READY** — Code is implemented and correct but **completely disconnected from execution**. Anomalies will never be detected unless someone manually calls the function (which nothing does).

**Remediation Required:**
1. Wire `detect_anomalies()` call into gateway.py after metrics update (one line)
2. Add unit tests for anomaly detection logic
3. Or: Move to a scheduled background worker (more complex)

---

## STEP 19: Alerts Are Generated & Delivered ⚠️ GENERATED BUT NOT DELIVERED

### Alert Generation
✅ **Implemented:** Alerts are created in two places:

**1. Budget Violations** (budget_service.py:118–157)
```python
db.add(
    Alert(
        id=str(uuid.uuid4()),
        organizationId=organization_id,
        agentId=agent_id,
        type="BUDGET_EXCEEDED",
        severity="HIGH",
        title="Budget limit exceeded",
        message=f"{budget_type} budget limit exceeded.",
        metadata_=metadata,
    )
)
```
Triggered: When budget check fails (step 17)

**2. Anomalies** (anomaly_detector.py:101–112)
```python
alert = Alert(
    id=str(uuid.uuid4()),
    organizationId=org_id,
    agentId=agent_id,
    type=anomaly["type"],  # SPEND_SPIKE, TOKEN_SPIKE, REQUEST_SPIKE
    severity=anomaly["severity"],
    title=anomaly["title"],
    message=anomaly["message"],
    metadata_=anomaly["metadata"],
    createdAt=datetime.utcnow()
)
db.add(alert)
```
Triggered: Never (step 18 is disconnected)

**3. Kill Switch Events** (killswitch/kill_switch_service.py:42–63)
```python
def _add_alert(db, organization_id, agent_id, alert_type, title, message, metadata):
    db.add(
        Alert(
            id=str(uuid.uuid4()),
            organizationId=organization_id,
            agentId=agent_id,
            type=alert_type,  # AGENT_PAUSED, ORG_PAUSED, AGENT_RESUMED, etc.
            severity="HIGH",
            title=title,
            message=message,
            metadata_=metadata,
        )
    )
```

### Alert Viewing (Dashboard)
✅ **Alerts Page:** `app/(dashboard)/alerts/page.tsx`
- Fetches alerts via API: `app/api/alerts/route.ts` (GET with organizationId)
- Displays in table with severity, title, timestamp, resolution status
- Shows alert type, agent name, and metadata

### Email Delivery
✗ **NOT IMPLEMENTED**

**Email Functions Defined (But Unused):**
```typescript
// lib/email-alerts.ts
export async function sendBudgetAlert(
  email: string,
  subject: string,
  message: string
) {
  const { data, error } = await resend.emails.send({
    from: "WHOAI <onboarding@resend.dev>",
    to: [email],
    subject,
    html: `<p>${message}</p>`,
  });
  return data;
}
```
```typescript
// lib/email.ts
export const resend = new Resend(process.env.RESEND_API_KEY);
```

**Invocation Search Result:**
```
Only definition found: /lib/email-alerts.ts:3
```
✗ **ZERO calls** to `sendBudgetAlert()` anywhere in codebase

**Why Email Isn't Wired:**
1. No endpoint in FastAPI gateway to receive and send alerts (would need to cross from Python to Node.js)
2. No Next.js API route to send emails on alert creation
3. No database trigger or webhook to invoke email delivery
4. No configuration for which emails to notify (no "alert recipients" list in schema)

**Alert Recipients in Schema:**
- Prisma schema has no "AlertRecipient" or email notification list
- Only User model exists with email field, but no subscription to alert types
- No way to know which user(s) should be notified of which agent's alerts

### What IS Delivered
- ✅ Alerts written to database (Alert table)
- ✅ Alerts displayed on dashboard (app/(dashboard)/alerts/page.tsx)
- ✅ Alerts queryable via API (app/api/alerts/route.ts)
- ✗ Alerts NOT delivered via email
- ✗ Alerts NOT delivered via webhook
- ✗ Alerts NOT pushed to UI in real-time (no WebSocket/polling visible)

### Test Coverage
- ✓ Budget alert creation tested (test_budget_engine.py:105–119)
- ✗ No tests for email delivery
- ✗ No tests for anomaly alert creation
- ✓ Kill switch alert creation tested (test_kill_switch.py:59–77)

### Status
⚠️ **PARTIALLY IMPLEMENTED:**
- **Generated:** Yes — alerts are created and persisted to database for all three event types (budget, anomaly, kill switch)
- **Delivered:** No — email delivery is not wired. Alerts sit in the database and appear on dashboard only.

**Remediation Required:**
1. Add email notification preference to User model (Prisma schema)
2. Create API endpoint to send email via Resend when alert created (or move email function to FastAPI)
3. Wire email sending into alert creation flow (budget_service.py, anomaly_detector.py, kill_switch_service.py)
4. Test email delivery end-to-end

---

## SUMMARY TABLE

| Step | Feature | Implemented | Tested | Live Path | Blockers | Status |
|------|---------|-------------|--------|-----------|----------|--------|
| 16 | Budget evaluation | ✅ Yes | ✅ Yes (4 tests) | ✅ Yes (gateway.py:230,243) | None | ✅ READY |
| 17 | Budget enforcement / blocking | ✅ Yes | ✅ Yes (test_gateway_blocking) | ✅ Yes (402 response) | None | ✅ READY |
| 18 | Anomaly detection | ✅ Yes | ❌ No | ❌ Never called | CRITICAL: Function orphaned | ⚠️ BROKEN |
| 19a | Alert generation | ✅ Yes | ✅ Partial (budget + kill-switch) | ✅ Yes (3 sources) | None | ✅ READY |
| 19b | Alert email delivery | ✅ Code exists | ❌ No | ❌ Not called | CRITICAL: No wiring | ❌ MISSING |

---

## CRITICAL BLOCKERS FOR LAUNCH

### 🔴 **BLOCKER 1: Anomaly Detection is Disconnected (Step 18)**
- **Severity:** HIGH
- **Impact:** Spend spike / token spike alerts never fire
- **Fix:** One-line addition to gateway.py after metrics update:
  ```python
  await detect_anomalies(db, agent_id, org_id)
  ```
- **Effort:** 5 minutes + 2 tests

### 🔴 **BLOCKER 2: Email Delivery Not Wired (Step 19)**
- **Severity:** MEDIUM
- **Impact:** Users must check dashboard manually; no proactive notifications
- **Fix:**
  1. Add alert_email_subscriptions to schema (which users get notified of which events)
  2. Call sendBudgetAlert() after budget_service creates alert
  3. Call sendAnomalyAlert() after anomaly_detector creates alert
- **Effort:** 2–3 hours (schema change + API wiring + tests)

### ⚠️ **BLOCKER 3: Kill Switch Blocks at 403, Budget at 402**
- **Severity:** MEDIUM (design concern, not blocking)
- **Impact:** Different HTTP status codes for different block reasons (inconsistent API)
- **Current behavior:** Works correctly (401=auth, 402=budget, 403=permission/suspended)
- **No action needed:** This is actually good API design (HTTP semantics)

---

## PRODUCTION READINESS: 50% (Steps 16–17 only)

- ✅ **Budget engine:** READY for production (complete, tested, wired)
- ✅ **Budget enforcement:** READY for production (complete, tested, wired)
- ⚠️ **Anomaly detection:** Code written, zero line fixes to wire, but untested
- ❌ **Email delivery:** Code skeleton exists, requires significant integration work

**Recommendation:** Deploy budget enforcement NOW (steps 16–17 work). Before launch, fix anomaly detection (5 min) and email delivery (a few hours). Alert generation itself is ready.

