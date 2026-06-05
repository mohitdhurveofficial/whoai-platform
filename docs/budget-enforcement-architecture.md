# WHOAI Budget Enforcement Engine

Phase 3 adds pre-provider budget enforcement to the runtime gateway. The Telemetry Engine continues to record usage and spend after successful provider calls; the Budget Enforcement Engine reads that spend before each provider call and blocks requests that would run after a configured limit has already been reached.

## Runtime Flow

1. Verify gateway JWT.
2. Load and validate the active agent.
3. Load the organization from the JWT organization claim.
4. Check agent daily and monthly budgets.
5. Check organization daily and monthly budgets.
6. Call the provider only when all checks return `allowed: true`.

When a limit is exceeded the gateway returns HTTP `402`:

```json
{
  "error": "Budget exceeded",
  "reason": "AGENT_DAILY_LIMIT_EXCEEDED"
}
```

The provider client is not constructed or called on budget blocks.

## Budget Types

- Agent daily budget
- Agent monthly budget
- Organization daily budget
- Organization monthly budget

Budget values of `0` are treated as unlimited. Spend is calculated from `SpendLog` for the current UTC day or month. Denormalized counters on `Agent` and `Organization` are updated by `runtime/telemetry/spend_logger.py` for dashboard performance.

## Reason Codes

- `AGENT_DAILY_LIMIT_EXCEEDED`
- `AGENT_MONTHLY_LIMIT_EXCEEDED`
- `ORG_DAILY_LIMIT_EXCEEDED`
- `ORG_MONTHLY_LIMIT_EXCEEDED`

## Records Created On Violation

Each budget block creates:

- `Alert` with `type=BUDGET_EXCEEDED`, `severity=HIGH`, `organizationId`, `agentId`, and metadata containing `budgetType`, `currentSpend`, `budgetLimit`, and `reason`.
- `ActivityLog` with `action=BUDGET_EXCEEDED`, `status=FAILURE`, and the same metadata.

## Dashboard Status

`/api/budgets/summary` exposes organization daily/monthly spend, remaining budgets, per-agent utilization, active alert count, and recent alerts.

Thresholds:

- `75%`: `WARNING`
- `90%`: `CRITICAL`
- `100%`: `BLOCKED`

The dashboard displays organization daily spend, organization monthly spend, remaining daily budget, remaining monthly budget, highest agent monthly utilization, and the warning/critical/block thresholds.
