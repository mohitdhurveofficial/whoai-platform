# Dashboard and Analytics

WHOAI Phase 6 adds production telemetry views for founders and operators:

- `/dashboard` shows total spend, today's spend, active agents, blocked requests, and spend charts.
- `/agents` lists agents with spend, request, block, budget, model, and activity analytics.
- `/agents/[id]` shows agent-level budget, spend, request, block, and activity details.
- `/usage` provides a global usage explorer with date, agent, model, and provider filters.

## API Endpoints

- `GET /api/dashboard/summary`
- `GET /api/dashboard/spend-by-day`
- `GET /api/dashboard/spend-by-agent`
- `GET /api/dashboard/spend-by-model`
- `GET /api/usage/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&agentId=...&model=...&provider=...`
- `GET /api/usage/requests?from=YYYY-MM-DD&to=YYYY-MM-DD&agentId=...&model=...&provider=...`
- `GET /api/agents/[id]/analytics`

## Data Sources

The implementation reads real telemetry only:

- `SpendLog` for spend totals, agent spend, model spend, and spend timelines.
- `RequestLog` for request counts and latency.
- `UsageMetrics` for token totals and cost/request averages.
- `ActivityLog` for blocked request counts and activity feeds.
- `Agent` for status, budgets, and management metadata.

## Security

Every aggregation accepts the authenticated `organizationId` from server auth context. Query parameters can filter within the authenticated organization, but cannot select an organization. Agent detail analytics use `findFirst({ id, organizationId })` so cross-tenant agent IDs return not found.

Blocked request counts include:

- `BUDGET_EXCEEDED`
- `REQUEST_BLOCKED`
- `RATE_LIMIT_EXCEEDED`

## Validation

Usage filters are validated in `lib/analytics/filters.ts`. Date ranges must be valid `YYYY-MM-DD` values, `from` must be before `to`, and ranges are capped at 366 days.

## Verification

Run:

```bash
npm run build
```

This runs Prisma client generation, Next.js compilation, and TypeScript checks for the dashboard, API routes, analytics service, and chart components.
