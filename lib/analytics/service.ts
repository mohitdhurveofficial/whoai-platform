import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AgentAnalytics,
  AgentAnalyticsRow,
  DashboardSummary,
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

function buildSpendWhere(organizationId: string, filters: UsageFilters = {}) {
  return {
    organizationId,
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
    ...(filters.agentId ? { agentId: filters.agentId } : {}),
    ...(filters.model ? { model: filters.model } : {}),
    ...(filters.provider ? { provider: filters.provider } : {}),
  };
}

function buildRequestWhere(organizationId: string, filters: UsageFilters = {}) {
  return {
    organizationId,
    ...(filters.from || filters.to
      ? {
          timestamp: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
    ...(filters.agentId ? { agentId: filters.agentId } : {}),
    ...(filters.model ? { model: filters.model } : {}),
    ...(filters.provider ? { provider: filters.provider } : {}),
  };
}

export async function getDashboardSummary(organizationId: string): Promise<DashboardSummary> {
  const today = startOfUtcDay(new Date());

  // Single raw query fetches all 4 aggregates + provider count in one round-trip.
  const [row] = await prisma.$queryRaw<
    Array<{
      total_spend: Prisma.Decimal | number | null;
      today_spend: Prisma.Decimal | number | null;
      active_agents: bigint | number;
      blocked_requests: bigint | number;
      provider_count: bigint | number;
    }>
  >`
    WITH
      total AS (
        SELECT COALESCE(SUM("cost"), 0) AS val FROM "SpendLog" WHERE "organizationId" = ${organizationId}
      ),
      today AS (
        SELECT COALESCE(SUM("cost"), 0) AS val FROM "SpendLog"
        WHERE "organizationId" = ${organizationId} AND "createdAt" >= ${today}
      ),
      agents AS (
        SELECT COUNT(*) AS val FROM "Agent" WHERE "organizationId" = ${organizationId} AND status = 'ACTIVE'
      ),
      blocked AS (
        SELECT COUNT(*) AS val FROM "ActivityLog"
        WHERE "organizationId" = ${organizationId}
          AND "action" IN ('BUDGET_EXCEEDED', 'REQUEST_BLOCKED', 'RATE_LIMIT_EXCEEDED')
      ),
      providers AS (
        SELECT COUNT(*) AS val FROM "ProviderCredential" WHERE "organizationId" = ${organizationId}
      )
    SELECT
      total.val AS total_spend,
      today.val AS today_spend,
      agents.val AS active_agents,
      blocked.val AS blocked_requests,
      providers.val AS provider_count
    FROM total, today, agents, blocked, providers
  `;

  return {
    totalSpend: toNumber(row.total_spend),
    todaySpend: toNumber(row.today_spend),
    activeAgents: Number(row.active_agents),
    blockedRequests: Number(row.blocked_requests),
    providerCount: Number(row.provider_count),
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
  const reqWhere = buildRequestWhere(organizationId, filters);
  const spendWhere = buildSpendWhere(organizationId, filters);

  // Build raw WHERE clauses for the two tables
  const reqConditions: string[] = [`"organizationId" = ${organizationId}`];
  if (filters.from) reqConditions.push(`"timestamp" >= ${filters.from.toISOString()}::timestamp`);
  if (filters.to) reqConditions.push(`"timestamp" <= ${filters.to.toISOString()}::timestamp`);
  if (filters.agentId) reqConditions.push(`"agentId" = ${filters.agentId}`);
  if (filters.model) reqConditions.push(`"model" = ${filters.model}`);
  if (filters.provider) reqConditions.push(`"provider" = ${filters.provider}`);
  const reqWhereClause = reqConditions.join(" AND ");

  const spendConditions: string[] = [`"organizationId" = ${organizationId}`];
  if (filters.from) spendConditions.push(`"createdAt" >= ${filters.from.toISOString()}::timestamp`);
  if (filters.to) spendConditions.push(`"createdAt" <= ${filters.to.toISOString()}::timestamp`);
  if (filters.agentId) spendConditions.push(`"agentId" = ${filters.agentId}`);
  if (filters.model) spendConditions.push(`"model" = ${filters.model}`);
  if (filters.provider) spendConditions.push(`"provider" = ${filters.provider}`);
  const spendWhereClause = spendConditions.join(" AND ");

  const metricsConditions: string[] = [`"organizationId" = ${organizationId}`];
  if (filters.from || filters.to) {
    metricsConditions.push(`"date" >= ${startOfUtcDay(filters.from ?? new Date(0)).toISOString()}::timestamp`);
    if (filters.to) metricsConditions.push(`"date" <= ${startOfUtcDay(filters.to).toISOString()}::timestamp`);
  }
  if (filters.agentId) metricsConditions.push(`"agentId" = ${filters.agentId}`);
  const metricsWhereClause = metricsConditions.join(" AND ");

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
        WHERE ${Prisma.raw(reqWhereClause)}
      ),
      spend AS (
        SELECT COALESCE(SUM("cost"), 0) AS val
        FROM "SpendLog"
        WHERE ${Prisma.raw(spendWhereClause)}
      ),
      metrics AS (
        SELECT COALESCE(SUM("totalTokens"), 0) AS tok,
               COALESCE(SUM("totalCost"), 0) AS cost,
               COALESCE(SUM("totalRequests"), 0) AS req
        FROM "UsageMetrics"
        WHERE ${Prisma.raw(metricsWhereClause)}
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
