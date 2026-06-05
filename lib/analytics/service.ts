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

  const [totalSpend, todaySpend, activeAgents, blockedRequests] = await Promise.all([
    prisma.spendLog.aggregate({
      where: { organizationId },
      _sum: { cost: true },
    }),
    prisma.spendLog.aggregate({
      where: { organizationId, createdAt: { gte: today } },
      _sum: { cost: true },
    }),
    prisma.agent.count({
      where: { organizationId, status: "ACTIVE" },
    }),
    prisma.activityLog.count({
      where: { organizationId, action: { in: BLOCKED_ACTIONS } },
    }),
  ]);

  return {
    totalSpend: toNumber(totalSpend._sum.cost),
    todaySpend: toNumber(todaySpend._sum.cost),
    activeAgents,
    blockedRequests,
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
  const rows = await prisma.spendLog.groupBy({
    by: ["agentId"],
    where: { organizationId },
    _sum: { cost: true },
    orderBy: { _sum: { cost: "desc" } },
  });

  const agents = await prisma.agent.findMany({
    where: { organizationId, id: { in: rows.map((row) => row.agentId) } },
    select: { id: true, name: true },
  });
  const names = new Map(agents.map((agent) => [agent.id, agent.name]));

  return rows.map((row) => ({
    agentId: row.agentId,
    agentName: names.get(row.agentId) ?? "Deleted agent",
    spend: toNumber(row._sum.cost),
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

  const [agents, todaySpend, monthlySpend, requests, blocked, lastActivity, latestModels] =
    await Promise.all([
      prisma.agent.findMany({
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
      }),
      prisma.spendLog.groupBy({
        by: ["agentId"],
        where: { organizationId, createdAt: { gte: today } },
        _sum: { cost: true },
      }),
      prisma.spendLog.groupBy({
        by: ["agentId"],
        where: { organizationId, createdAt: { gte: month } },
        _sum: { cost: true },
      }),
      prisma.requestLog.groupBy({
        by: ["agentId"],
        where: { organizationId },
        _count: { _all: true },
      }),
      prisma.activityLog.groupBy({
        by: ["agentId"],
        where: { organizationId, action: { in: BLOCKED_ACTIONS }, agentId: { not: null } },
        _count: { _all: true },
      }),
      prisma.activityLog.groupBy({
        by: ["agentId"],
        where: { organizationId, agentId: { not: null } },
        _max: { timestamp: true },
      }),
      prisma.spendLog.findMany({
        where: { organizationId },
        distinct: ["agentId"],
        orderBy: { createdAt: "desc" },
        select: { agentId: true, model: true },
      }),
    ]);

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
  const [requests, spend, metrics] = await Promise.all([
    prisma.requestLog.aggregate({
      where: buildRequestWhere(organizationId, filters),
      _count: { _all: true },
      _avg: { latencyMs: true },
    }),
    prisma.spendLog.aggregate({
      where: buildSpendWhere(organizationId, filters),
      _sum: { cost: true },
    }),
    prisma.usageMetrics.aggregate({
      where: {
        organizationId,
        ...(filters.from || filters.to
          ? {
              date: {
                ...(filters.from ? { gte: startOfUtcDay(filters.from) } : {}),
                ...(filters.to ? { lte: startOfUtcDay(filters.to) } : {}),
              },
            }
          : {}),
        ...(filters.agentId ? { agentId: filters.agentId } : {}),
      },
      _sum: { totalTokens: true, totalCost: true, totalRequests: true },
    }),
  ]);

  const totalRequests = requests._count._all || metrics._sum.totalRequests || 0;
  const totalSpend = toNumber(spend._sum.cost) || toNumber(metrics._sum.totalCost);

  return {
    totalRequests,
    totalTokens: metrics._sum.totalTokens ?? 0,
    totalSpend,
    averageCost: totalRequests > 0 ? totalSpend / totalRequests : 0,
    averageLatency: requests._avg.latencyMs ?? 0,
  };
}

export async function getUsageRequests(
  organizationId: string,
  filters: UsageFilters = {},
): Promise<UsageRequestRow[]> {
  const [rows, summary] = await Promise.all([
    prisma.requestLog.findMany({
      where: buildRequestWhere(organizationId, filters),
      orderBy: { timestamp: "desc" },
      take: 100,
      select: {
        id: true,
        timestamp: true,
        agentId: true,
        provider: true,
        model: true,
        statusCode: true,
        latencyMs: true,
        agent: { select: { name: true } },
      },
    }),
    getUsageSummary(organizationId, filters),
  ]);

  const averageTokens = summary.totalRequests > 0 ? summary.totalTokens / summary.totalRequests : 0;

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp.toISOString(),
    agentId: row.agentId,
    agentName: row.agent.name,
    provider: row.provider,
    model: row.model,
    statusCode: row.statusCode,
    latencyMs: row.latencyMs,
    tokens: Math.round(averageTokens),
    spend: summary.averageCost,
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

  const [spendByDay, requestsByDayRows, blockedRequests, usage, latestSpend, recentActivity] =
    await Promise.all([
      getSpendByDay(organizationId, 30, agentId),
      prisma.$queryRaw<Array<{ day: Date | string; requests: bigint | number }>>`
        SELECT DATE("timestamp") AS day, COUNT(*) AS requests
        FROM "RequestLog"
        WHERE "organizationId" = ${organizationId}
          AND "agentId" = ${agentId}
          AND "timestamp" >= ${lastNDays(30).start}
        GROUP BY DATE("timestamp")
        ORDER BY day ASC
      `,
      prisma.activityLog.count({
        where: { organizationId, agentId, action: { in: BLOCKED_ACTIONS } },
      }),
      getUsageSummary(organizationId, { agentId }),
      prisma.spendLog.findFirst({
        where: { organizationId, agentId },
        orderBy: { createdAt: "desc" },
        select: { model: true },
      }),
      prisma.activityLog.findMany({
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
      }),
    ]);

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
