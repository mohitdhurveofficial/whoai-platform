# WHOAI Kill Switch Engine

Phase 5 adds active stop controls for runaway AI spend. The Budget Engine decides whether a limit is exhausted; the Kill Switch Engine mutates agent or organization state so future traffic cannot spend.

## Gateway Flow

1. Authenticate the gateway JWT.
2. Load and validate the agent and organization.
3. Run kill-switch state checks.
4. Run budget checks.
5. Auto-pause the agent or organization if a budget is exhausted.
6. Call the AI provider only when every check allows the request.

Paused, quarantined, and terminated agents are blocked before provider calls. Paused organizations are also blocked before provider calls.

## States

Agent states:

- `ACTIVE`: requests allowed
- `PAUSED`: requests blocked
- `QUARANTINED`: requests blocked
- `TERMINATED`: requests blocked permanently

Organization states:

- `ACTIVE`: requests allowed
- `PAUSED`: requests blocked
- `TERMINATED`: requests blocked

## Auto-Pause Rules

- Agent daily budget exceeded: pause agent with `DAILY_BUDGET_EXCEEDED`
- Agent monthly budget exceeded: pause agent with `MONTHLY_BUDGET_EXCEEDED`
- Organization daily budget exceeded: pause organization with `DAILY_BUDGET_EXCEEDED`
- Organization monthly budget exceeded: pause organization with `MONTHLY_BUDGET_EXCEEDED`

The initial budget-exhausting request returns HTTP `402` with `Budget exceeded`. Future requests return HTTP `403` with the paused entity error.

Agent paused response:

```json
{
  "error": "Agent paused",
  "reason": "DAILY_BUDGET_EXCEEDED"
}
```

Organization paused response:

```json
{
  "error": "Organization paused",
  "reason": "MONTHLY_BUDGET_EXCEEDED"
}
```

## Alerts And Activity Logs

The engine creates `Alert` records with severity `HIGH` for:

- `BUDGET_EXCEEDED`
- `AGENT_PAUSED`
- `ORG_PAUSED`
- `AGENT_RESUMED`
- `ORG_RESUMED`

It creates `ActivityLog` records for:

- `BUDGET_EXCEEDED`
- `AGENT_PAUSED`
- `ORG_PAUSED`
- `AGENT_RESUMED`
- `ORG_RESUMED`
- `REQUEST_BLOCKED`

Metadata includes:

```json
{
  "reason": "DAILY_BUDGET_EXCEEDED",
  "budgetLimit": 100,
  "currentSpend": 150
}
```

## Manual Controls

App Router endpoints:

- `POST /api/agents/[id]/pause`
- `POST /api/agents/[id]/resume`
- `POST /api/organizations/[id]/pause`
- `POST /api/organizations/[id]/resume`

Terminated agents cannot be resumed.

## Dashboard

`/api/budgets/summary` returns live kill-switch status alongside budget data:

- Agent status and pause metadata
- Organization status and pause metadata
- Current spend and remaining budget
- Blocked request count from `REQUEST_BLOCKED` activity logs
- Budget thresholds: `75%` warning, `90%` critical, `100%` auto-pause
