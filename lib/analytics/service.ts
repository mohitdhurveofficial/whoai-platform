import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AgentAnalytics,
  AgentAnalyticsRow,
  DashboardBundle,
  SpendByAgentPoint,
  SpendByDayPoint,
  SpendByModelPoint,
  UsageFilters,
  UsageRequestRow,
  UsageSummary,
} from "@/lib/analytics/types";

const BLOCKED_ACTIONS = [
  "BUDGET_EXCEEDED",
  "REQUEST_BLOCKED",
  "RATE_LIMIT_EXCEEDED",
];

function toNumber(value: unknown): number {
  if (value instanceof Prisma.Decimal) return value.toNumber();
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return 0;
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function startOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function addUtcDays(value: Date, days: number): Date {
  const copy = new Date(value);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function startOfUtcMonth(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
}

function lastNDays(days: number): { start: Date; points: SpendByDayPoint[] } {
  const today = startOfUtcDay(new Date());
  const start = addUtcDays(today, -(days - 1));
  const points = Array.from({ length: days }, (_, index) => ({
    date: isoDate(addUtcDays(start, index)),
    spend: 0,
  }));

  return { start, points };
}

/**
 * Everything the dashboard draws, in one round trip.
 *
 * The page used to call four query functions one after another, and then the
 * KPI cards fetched six more aggregates from the browser after hydration.
 * Production runs Prisma through PgBouncer with connection_limit=1, so none of
 * that overlaps — every query is a full serial round trip to Supabase, and the
 * client fetch does not even start until the HTML has landed. Postgres can
 * compute all of it at once, so it does.
 */
export async function getDashboardBundle(organizationId: string): Promise<DashboardBundle> {
  const today = startOfUtcDay(new Date());
  const { start, points } = lastNDays(30);
  const blockedActions = Prisma.join(BLOCKED_ACTIONS);

  const [row] = await prisma.$queryRaw<
    Array<{
      total_spend: Prisma.Decimal | number | null;
      today_spend: Prisma.Decimal | number | null;
      spend_tokens: bigint | number | null;
      metric_cost: Prisma.Decimal | number | null;
      metric_requests: Prisma.Decimal | number | null;
      metric_tokens: Prisma.Decimal | number | null;
      active_agents: bigint | number;
      request_count: bigint | number;
      blocked_requests: bigint | number;
      provider_count: bigint | number;
      active_alerts: bigint | number;
      monthly_budget: Prisma.Decimal | number | null;
      current_monthly_spend: Prisma.Decimal | number | null;
      spend_by_day: Array<{ date: string; spend: number | string }>;
      spend_by_agent: Array<{ agentId: string; agentName: string | null; spend: number | string }>;
      spend_by_model: Array<{ model: string; spend: number | string }>;
    }>
  >`
    WITH
      spend AS (
        SELECT
          COALESCE(SUM("cost"), 0) AS total,
          COALESCE(SUM("cost") FILTER (WHERE "createdAt" >= ${today}), 0) AS today,
          COALESCE(SUM("tokensIn" + "tokensOut"), 0) AS tokens
        FROM "SpendLog"
        WHERE "organizationId" = ${organizationId}
      ),
      metrics AS (
        SELECT
          COALESCE(SUM("totalCost"), 0) AS cost,
          COALESCE(SUM("totalRequests"), 0) AS requests,
          COALESCE(SUM("totalTokens"), 0) AS tokens
        FROM "UsageMetrics"
        WHERE "organizationId" = ${organizationId}
      ),
      by_day AS (
        SELECT COALESCE(
          json_agg(json_build_object('date', to_char(day, 'YYYY-MM-DD'), 'spend', spend) ORDER BY day),
          '[]'::json
        ) AS rows
        FROM (
          SELECT DATE("createdAt") AS day, COALESCE(SUM("cost"), 0) AS spend
          FROM "SpendLog"
          WHERE "organizationId" = ${organizationId} AND "createdAt" >= ${start}
          GROUP BY 1
        ) d
      ),
      by_agent AS (
        SELECT COALESCE(
          json_agg(json_build_object('agentId', agent_id, 'agentName', agent_name, 'spend', spend) ORDER BY spend DESC),
          '[]'::json
        ) AS rows
        FROM (
          SELECT a.id AS agent_id, a.name AS agent_name, COALESCE(SUM(s."cost"), 0) AS spend
          FROM "Agent" a
          LEFT JOIN "SpendLog" s ON s."agentId" = a.id
          WHERE a."organizationId" = ${organizationId}
          GROUP BY a.id, a.name
        ) g
      ),
      by_model AS (
        SELECT COALESCE(
          json_agg(json_build_object('model', model, 'spend', spend) ORDER BY spend DESC),
          '[]'::json
        ) AS rows
        FROM (
          SELECT "model" AS model, COALESCE(SUM("cost"), 0) AS spend
          FROM "SpendLog"
          WHERE "organizationId" = ${organizationId}
          GROUP BY "model"
        ) m
      )
    SELECT
      spend.total AS total_spend,
      spend.today AS today_spend,
      spend.tokens AS spend_tokens,
      metrics.cost AS metric_cost,
      metrics.requests AS metric_requests,
      metrics.tokens AS metric_tokens,
      (SELECT COUNT(*) FROM "Agent" WHERE "organizationId" = ${organizationId} AND status = 'ACTIVE') AS active_agents,
      (SELECT COUNT(*) FROM "RequestLog" WHERE "organizationId" = ${organizationId}) AS request_count,
      (SELECT COUNT(*) FROM "ActivityLog" WHERE "organizationId" = ${organizationId} AND "action" IN (${blockedActions})) AS blocked_requests,
      (SELECT COUNT(*) FROM "ProviderCredential" WHERE "organizationId" = ${organizationId}) AS provider_count,
      (SELECT COUNT(*) FROM "Alert" WHERE "organizationId" = ${organizationId} AND "resolved" = false) AS active_alerts,
      (SELECT "monthlyBudget" FROM "Organization" WHERE id = ${organizationId}) AS monthly_budget,
      (SELECT "currentMonthlySpend" FROM "Organization" WHERE id = ${organizationId}) AS current_monthly_spend,
      by_day.rows AS spend_by_day,
      by_agent.rows AS spend_by_agent,
      by_model.rows AS spend_by_model
    FROM spend, metrics, by_day, by_agent, by_model
  `;

  const spendByDate = new Map(row.spend_by_day.map((point) => [point.date, toNumber(point.spend)]));

  // SpendLog is the truth once the gateway has run; UsageMetrics is the rolled-up
  // fallback for workspaces migrated before per-request logging existed.
  const spendLogTotal = toNumber(row.total_spend);
  const requestLogCount = Number(row.request_count);
  const spendLogTokens = toNumber(row.spend_tokens);
  const monthlyBudget = toNumber(row.monthly_budget);

  return {
    summary: {
      totalSpend: spendLogTotal,
      todaySpend: toNumber(row.today_spend),
      activeAgents: Number(row.active_agents),
      blockedRequests: Number(row.blocked_requests),
      providerCount: Number(row.provider_count),
    },
    kpis: {
      totalSpend: spendLogTotal || toNumber(row.metric_cost),
      totalRequests: requestLogCount || toNumber(row.metric_requests),
      totalTokens: spendLogTokens || toNumber(row.metric_tokens),
      activeAgents: Number(row.active_agents),
      budgetRemaining:
        monthlyBudget > 0 ? monthlyBudget - toNumber(row.current_monthly_spend) : null,
      activeAlerts: Number(row.active_alerts),
    },
    // Days with no spend produce no row, so the series is padded here rather
    // than with generate_series — the chart needs all 30 points to keep its
    // x-axis honest.
    spendByDay: points.map((point) => ({ ...point, spend: spendByDate.get(point.date) ?? 0 })),
    spendByAgent: row.spend_by_agent.map((agent) => ({
      agentId: agent.agentId,
      agentName: agent.agentName ?? "Deleted agent",
      spend: toNumber(agent.spend),
    })),
    spendByModel: row.spend_by_model.map((model) => ({
      model: model.model,
      spend: toNumber(model.spend),
    })),
  };
}

export async function getSpendByDay(
  organizationId: string,
  days = 30,
  agentId?: string,
): Promise<SpendByDayPoint[]> {
  const { start, points } = lastNDays(days);
  const rows = await prisma.$queryRaw<Array<{ day: Date | string; spend: Prisma.Decimal | string | number }>>`
    SELECT DATE("createdAt") AS day, COALESCE(SUM("cost"), 0) AS spend
    FROM "SpendLog"
    WHERE "organizationId" = ${organizationId}
      AND "createdAt" >= ${start}
      AND (${agentId ?? null}::text IS NULL OR "agentId" = ${agentId ?? null})
    GROUP BY DATE("createdAt")
    ORDER BY day ASC
  `;

  const spendByDate = new Map(
    rows.map((row) => [
      typeof row.day === "string" ? row.day.slice(0, 10) : isoDate(row.day),
      toNumber(row.spend),
    ]),
  );

  return points.map((point) => ({
    ...point,
    spend: spendByDate.get(point.date) ?? 0,
  }));
}

export async function getSpendByAgent(organizationId: string): Promise<SpendByAgentPoint[]> {
  // Single JOIN query replaces two separate Prisma calls (groupBy + findMany).
  const rows = await prisma.$queryRaw<
    Array<{
      agent_id: string;
      agent_name: string;
      spend: Prisma.Decimal | number | null;
    }>
  >`
    SELECT
      a.id AS agent_id,
      a.name AS agent_name,
      COALESCE(SUM(s."cost"), 0) AS spend
    FROM "Agent" a
    LEFT JOIN "SpendLog" s ON s."agentId" = a.id
    WHERE a."organizationId" = ${organizationId}
    GROUP BY a.id, a.name
    ORDER BY spend DESC
  `;

  return rows.map((row) => ({
    agentId: row.agent_id,
    agentName: row.agent_name ?? "Deleted agent",
    spend: toNumber(row.spend),
  }));
}

export async function getSpendByModel(organizationId: string): Promise<SpendByModelPoint[]> {
  const rows = await prisma.spendLog.groupBy({
    by: ["model"],
    where: { organizationId },
    _sum: { cost: true },
    orderBy: { _sum: { cost: "desc" } },
  });

  return rows.map((row) => ({
    model: row.model,
    spend: toNumber(row._sum.cost),
  }));
}

export async function getAgentsAnalytics(organizationId: string): Promise<AgentAnalyticsRow[]> {
  const today = startOfUtcDay(new Date());
  const month = startOfUtcMonth(new Date());

  // Sequential to prevent PgBouncer deadlock in production.
  const agents = await prisma.agent.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      dailyBudget: true,
      currentDailySpend: true,
      monthlyBudget: true,
      createdAt: true,
    },
  });
  const todaySpend = await prisma.spendLog.groupBy({
    by: ["agentId"],
    where: { organizationId, createdAt: { gte: today } },
    _sum: { cost: true },
  });
  const monthlySpend = await prisma.spendLog.groupBy({
    by: ["agentId"],
    where: { organizationId, createdAt: { gte: month } },
    _sum: { cost: true },
  });
  const requests = await prisma.requestLog.groupBy({
    by: ["agentId"],
    where: { organizationId },
    _count: { _all: true },
  });
  const blocked = await prisma.activityLog.groupBy({
    by: ["agentId"],
    where: { organizationId, action: { in: BLOCKED_ACTIONS }, agentId: { not: null } },
    _count: { _all: true },
  });
  const lastActivity = await prisma.activityLog.groupBy({
    by: ["agentId"],
    where: { organizationId, agentId: { not: null } },
    _max: { timestamp: true },
  });
  const latestModels = await prisma.spendLog.findMany({
    where: { organizationId },
    distinct: ["agentId"],
    orderBy: { createdAt: "desc" },
    select: { agentId: true, model: true },
  });

  const todayByAgent = new Map(todaySpend.map((row) => [row.agentId, toNumber(row._sum.cost)]));
  const monthByAgent = new Map(monthlySpend.map((row) => [row.agentId, toNumber(row._sum.cost)]));
  const requestsByAgent = new Map(requests.map((row) => [row.agentId, row._count._all]));
  const blockedByAgent = new Map(blocked.map((row) => [row.agentId, row._count._all]));
  const activityByAgent = new Map(
    lastActivity.map((row) => [row.agentId, row._max.timestamp?.toISOString() ?? null]),
  );
  const modelByAgent = new Map(latestModels.map((row) => [row.agentId, row.model]));

  return agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    status: agent.status,
    model: modelByAgent.get(agent.id) ?? null,
    todaySpend: todayByAgent.get(agent.id) ?? 0,
    monthlySpend: monthByAgent.get(agent.id) ?? 0,
    dailyBudget: toNumber(agent.dailyBudget),
    monthlyBudget: toNumber(agent.monthlyBudget),
    requests: requestsByAgent.get(agent.id) ?? 0,
    blockedRequests: blockedByAgent.get(agent.id) ?? 0,
    lastActivity: activityByAgent.get(agent.id) ?? null,
    createdAt: agent.createdAt.toISOString(),
  }));
}

export async function getUsageSummary(
  organizationId: string,
  filters: UsageFilters = {},
): Promise<UsageSummary> {
  // WHERE clauses are assembled from Prisma.sql fragments, never from string
  // concatenation: `model` / `provider` / `agentId` arrive straight off the
  // query string, so interpolating them into SQL text would be injectable — and
  // an unquoted id like `org_abc` isn't even valid SQL to begin with.
  const reqConditions: Prisma.Sql[] = [Prisma.sql`"organizationId" = ${organizationId}`];
  if (filters.from) reqConditions.push(Prisma.sql`"timestamp" >= ${filters.from}`);
  if (filters.to) reqConditions.push(Prisma.sql`"timestamp" <= ${filters.to}`);
  if (filters.agentId) reqConditions.push(Prisma.sql`"agentId" = ${filters.agentId}`);
  if (filters.model) reqConditions.push(Prisma.sql`"model" = ${filters.model}`);
  if (filters.provider) reqConditions.push(Prisma.sql`"provider" = ${filters.provider}`);
  const reqWhereClause = Prisma.join(reqConditions, " AND ");

  const spendConditions: Prisma.Sql[] = [Prisma.sql`"organizationId" = ${organizationId}`];
  if (filters.from) spendConditions.push(Prisma.sql`"createdAt" >= ${filters.from}`);
  if (filters.to) spendConditions.push(Prisma.sql`"createdAt" <= ${filters.to}`);
  if (filters.agentId) spendConditions.push(Prisma.sql`"agentId" = ${filters.agentId}`);
  if (filters.model) spendConditions.push(Prisma.sql`"model" = ${filters.model}`);
  if (filters.provider) spendConditions.push(Prisma.sql`"provider" = ${filters.provider}`);
  const spendWhereClause = Prisma.join(spendConditions, " AND ");

  const metricsConditions: Prisma.Sql[] = [Prisma.sql`"organizationId" = ${organizationId}`];
  if (filters.from || filters.to) {
    metricsConditions.push(Prisma.sql`"date" >= ${startOfUtcDay(filters.from ?? new Date(0))}`);
    if (filters.to) metricsConditions.push(Prisma.sql`"date" <= ${startOfUtcDay(filters.to)}`);
  }
  if (filters.agentId) metricsConditions.push(Prisma.sql`"agentId" = ${filters.agentId}`);
  const metricsWhereClause = Prisma.join(metricsConditions, " AND ");

  const [row] = await prisma.$queryRaw<
    Array<{
      total_requests: bigint | number;
      avg_latency: Prisma.Decimal | number | null;
      total_spend: Prisma.Decimal | number | null;
      metric_tokens: Prisma.Decimal | number | null;
      metric_cost: Prisma.Decimal | number | null;
      metric_requests: Prisma.Decimal | number | null;
    }>
  >`
    WITH
      reqs AS (
        SELECT COUNT(*) AS cnt, COALESCE(AVG("latencyMs"), 0) AS lat
        FROM "RequestLog"
        WHERE ${reqWhereClause}
      ),
      spend AS (
        SELECT COALESCE(SUM("cost"), 0) AS val
        FROM "SpendLog"
        WHERE ${spendWhereClause}
      ),
      metrics AS (
        SELECT COALESCE(SUM("totalTokens"), 0) AS tok,
               COALESCE(SUM("totalCost"), 0) AS cost,
               COALESCE(SUM("totalRequests"), 0) AS req
        FROM "UsageMetrics"
        WHERE ${metricsWhereClause}
      )
    SELECT
      reqs.cnt AS total_requests,
      reqs.lat AS avg_latency,
      spend.val AS total_spend,
      metrics.tok AS metric_tokens,
      metrics.cost AS metric_cost,
      metrics.req AS metric_requests
    FROM reqs, spend, metrics
  `;

  const totalRequests = Number(row.total_requests) || Number(row.metric_requests ?? 0);
  const totalSpend = toNumber(row.total_spend) || toNumber(row.metric_cost);

  return {
    totalRequests,
    totalTokens: toNumber(row.metric_tokens),
    totalSpend,
    averageCost: totalRequests > 0 ? totalSpend / totalRequests : 0,
    averageLatency: toNumber(row.avg_latency),
  };
}

export async function getUsageRequests(
  organizationId: string,
  filters: UsageFilters = {},
): Promise<UsageRequestRow[]> {
  // Single raw query joins SpendLog (real tokens / cost) with nearest RequestLog
  // (status / latency) via LATERAL, so every row shows its ACTUAL values instead
  // of averaged garbage.
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      timestamp: Date;
      agent_id: string;
      agent_name: string;
      provider: string;
      model: string;
      status_code: number | null;
      latency_ms: number | null;
      tokens_in: number;
      tokens_out: number;
      cost: Prisma.Decimal | number;
    }>
  >`
    SELECT
      s.id,
      s."createdAt" AS timestamp,
      s."agentId" AS agent_id,
      a.name AS agent_name,
      s.provider,
      s.model,
      r."statusCode" AS status_code,
      r."latencyMs" AS latency_ms,
      s."tokensIn" AS tokens_in,
      s."tokensOut" AS tokens_out,
      s.cost
    FROM "SpendLog" s
    LEFT JOIN LATERAL (
      SELECT "statusCode", "latencyMs"
      FROM "RequestLog"
      WHERE "organizationId" = s."organizationId"
        AND "agentId" = s."agentId"
        AND model = s.model
        AND timestamp >= s."createdAt" - INTERVAL '2 seconds'
        AND timestamp <= s."createdAt" + INTERVAL '2 seconds'
      ORDER BY ABS(EXTRACT(EPOCH FROM (timestamp - s."createdAt")))
      LIMIT 1
    ) r ON true
    LEFT JOIN "Agent" a ON a.id = s."agentId"
    WHERE s."organizationId" = ${organizationId}
      AND (${filters.agentId ?? null}::text IS NULL OR s."agentId" = ${filters.agentId ?? null})
      AND (${filters.model ?? null}::text IS NULL OR s.model = ${filters.model ?? null})
      AND (${filters.provider ?? null}::text IS NULL OR s.provider = ${filters.provider ?? null})
      AND (${filters.from ?? null}::timestamp IS NULL OR s."createdAt" >= ${filters.from ?? null})
      AND (${filters.to ?? null}::timestamp IS NULL OR s."createdAt" <= ${filters.to ?? null})
    ORDER BY s."createdAt" DESC
    LIMIT 100
  `;

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp.toISOString(),
    agentId: row.agent_id,
    agentName: row.agent_name ?? "Deleted agent",
    provider: row.provider,
    model: row.model,
    statusCode: row.status_code ?? 200,
    latencyMs: row.latency_ms ?? 0,
    tokens: row.tokens_in + row.tokens_out,
    spend: toNumber(row.cost),
  }));
}

export async function getAgentAnalytics(
  organizationId: string,
  agentId: string,
): Promise<AgentAnalytics | null> {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, organizationId },
    select: {
      id: true,
      name: true,
      status: true,
      dailyBudget: true,
      monthlyBudget: true,
      currentDailySpend: true,
      createdAt: true,
    },
  });

  if (!agent) return null;

  // Sequential to prevent PgBouncer deadlock in production.
  const spendByDay = await getSpendByDay(organizationId, 30, agentId);
  const requestsByDayRows = await prisma.$queryRaw<Array<{ day: Date | string; requests: bigint | number }>>`
    SELECT DATE("timestamp") AS day, COUNT(*) AS requests
    FROM "RequestLog"
    WHERE "organizationId" = ${organizationId}
      AND "agentId" = ${agentId}
      AND "timestamp" >= ${lastNDays(30).start}
    GROUP BY DATE("timestamp")
    ORDER BY day ASC
  `;
  const blockedRequests = await prisma.activityLog.count({
    where: { organizationId, agentId, action: { in: BLOCKED_ACTIONS } },
  });
  const usage = await getUsageSummary(organizationId, { agentId });
  const latestSpend = await prisma.spendLog.findFirst({
    where: { organizationId, agentId },
    orderBy: { createdAt: "desc" },
    select: { model: true },
  });
  const recentActivity = await prisma.activityLog.findMany({
    where: { organizationId, agentId },
    orderBy: { timestamp: "desc" },
    take: 12,
    select: {
      id: true,
      action: true,
      status: true,
      timestamp: true,
      metadata: true,
    },
  });

  const { points } = lastNDays(30);
  const requestsByDate = new Map(
    requestsByDayRows.map((row) => [
      typeof row.day === "string" ? row.day.slice(0, 10) : isoDate(row.day),
      toNumber(row.requests),
    ]),
  );
  const requestsByDay = points.map((point) => ({
    date: point.date,
    requests: requestsByDate.get(point.date) ?? 0,
  }));
  const currentSpend = toNumber(agent.currentDailySpend);const monthlyBudget = toNumber(agent.monthlyBudget);

  return {
    agent: {
      id: agent.id,
      name: agent.name,
      status: agent.status,
      model: latestSpend?.model ?? null,
      createdAt: agent.createdAt.toISOString(),
      dailyBudget: toNumber(agent.dailyBudget),
      monthlyBudget,
      currentSpend,
      remainingBudget: monthlyBudget > 0 ? Math.max(monthlyBudget - currentSpend, 0) : 0,
    },
    spendByDay,
    requestsByDay,
    blockedRequests,
    averageCostPerRequest: usage.averageCost,
    averageTokensPerRequest:
      usage.totalRequests > 0 ? usage.totalTokens / usage.totalRequests : 0,
    recentActivity: recentActivity.map((activity) => ({
      id: activity.id,
      action: activity.action,
      status: activity.status,
      timestamp: activity.timestamp.toISOString(),
      metadata: activity.metadata,
    })),
  };
}
