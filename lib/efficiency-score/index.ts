/**
 * WHOAI Agent Efficiency Score
 * Measures cost-per-outcome, not just cost-per-request.
 * An agent that spends $0.10 to generate $100 of value is efficient.
 * An agent that spends $5.00 to generate $0 of value is wasteful.
 *
 * This is a category-defining metric — no competitor tracks
 * cost efficiency at the agent level.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface EfficiencyMetrics {
  /** Overall efficiency score (0–100). Higher is better. */
  score: number;
  /** Dollars spent per 1,000 tokens generated */
  costPerKTokens: number;
  /** Average tokens consumed per request */
  tokensPerRequest: number;
  /** Average cost per request in dollars */
  costPerRequest: number;
  /** Success rate (200s / total requests) */
  successRate: number;
  /** Percentage of spend that was cached (avoided) */
  cacheAvoidancePercent: number;
  /** Latency efficiency: ms per 100 tokens */
  latencyPer100Tokens: number;
  /** Trend vs last 7 days: "improving", "stable", "degrading" */
  trend: "improving" | "stable" | "degrading";
  /** Grade: A+, A, B, C, D, F */
  grade: string;
  /** What the score means in plain English */
  summary: string;
}

interface RawMetrics {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  successfulRequests: number;
  totalLatencyMs: number;
  cachedCostAvoided: number;
}

interface AgentWindows {
  agentId: string;
  agentName: string;
  current: RawMetrics;
  previous: RawMetrics;
}

const NO_DATA: EfficiencyMetrics = {
  score: 0,
  costPerKTokens: 0,
  tokensPerRequest: 0,
  costPerRequest: 0,
  successRate: 0,
  cacheAvoidancePercent: 0,
  latencyPer100Tokens: 0,
  trend: "stable",
  grade: "N/A",
  summary: "No requests in the selected period.",
};

const EMPTY: RawMetrics = {
  totalCost: 0,
  totalTokens: 0,
  totalRequests: 0,
  successfulRequests: 0,
  totalLatencyMs: 0,
  cachedCostAvoided: 0,
};

function toNumber(value: unknown): number {
  if (value instanceof Prisma.Decimal) return value.toNumber();
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

/**
 * Every agent's counters for the scoring window and the one before it, in one
 * round trip.
 *
 * This used to be four queries per agent — two windows x (SpendLog, RequestLog)
 * — each a findMany that shipped every row across the wire so JavaScript could
 * add them up. Production runs through PgBouncer with connection_limit=1, so
 * those queries never overlap no matter how much Promise.all wraps them: a
 * ten-agent workspace paid forty-one serial round trips to draw one leaderboard.
 * Postgres does the arithmetic here and returns two rows per agent.
 */
async function fetchAgentWindows(
  organizationId: string,
  days: number,
  agentId?: string,
): Promise<AgentWindows[]> {
  const now = Date.now();
  const since = new Date(now - days * 24 * 60 * 60 * 1000);
  const previousSince = new Date(now - days * 2 * 24 * 60 * 60 * 1000);

  const rows = await prisma.$queryRaw<
    Array<{
      agent_id: string;
      agent_name: string | null;
      is_current: boolean;
      requests: bigint | number;
      cost: Prisma.Decimal | number | null;
      tokens: bigint | number | null;
      cached_cost: Prisma.Decimal | number | null;
      successes: bigint | number;
      latency_ms: bigint | number | null;
    }>
  >`
    WITH spend AS (
      SELECT
        "agentId" AS agent_id,
        ("createdAt" >= ${since}) AS is_current,
        COUNT(*) AS requests,
        COALESCE(SUM("cost"), 0) AS cost,
        COALESCE(SUM("tokensIn" + "tokensOut"), 0) AS tokens,
        COALESCE(SUM(CASE WHEN "metadata"->>'cached' = 'true' THEN "cost" ELSE 0 END), 0) AS cached_cost
      FROM "SpendLog"
      WHERE "organizationId" = ${organizationId} AND "createdAt" >= ${previousSince}
      GROUP BY 1, 2
    ),
    reqs AS (
      SELECT
        "agentId" AS agent_id,
        ("timestamp" >= ${since}) AS is_current,
        COUNT(*) FILTER (WHERE COALESCE("statusCode", 200) < 400) AS successes,
        COALESCE(SUM(COALESCE("latencyMs", 0)), 0) AS latency_ms
      FROM "RequestLog"
      WHERE "organizationId" = ${organizationId} AND "timestamp" >= ${previousSince}
      GROUP BY 1, 2
    ),
    windows AS (SELECT true AS is_current UNION ALL SELECT false)
    SELECT
      a.id AS agent_id,
      a.name AS agent_name,
      w.is_current,
      COALESCE(s.requests, 0) AS requests,
      COALESCE(s.cost, 0) AS cost,
      COALESCE(s.tokens, 0) AS tokens,
      COALESCE(s.cached_cost, 0) AS cached_cost,
      COALESCE(r.successes, 0) AS successes,
      COALESCE(r.latency_ms, 0) AS latency_ms
    FROM "Agent" a
    CROSS JOIN windows w
    LEFT JOIN spend s ON s.agent_id = a.id AND s.is_current = w.is_current
    LEFT JOIN reqs r ON r.agent_id = a.id AND r.is_current = w.is_current
    WHERE a."organizationId" = ${organizationId}
      AND (${agentId ?? null}::text IS NULL OR a.id = ${agentId ?? null})
  `;

  const byAgent = new Map<string, AgentWindows>();

  for (const row of rows) {
    const entry = byAgent.get(row.agent_id) ?? {
      agentId: row.agent_id,
      agentName: row.agent_name ?? "Unnamed agent",
      current: { ...EMPTY },
      previous: { ...EMPTY },
    };

    // totalRequests counts SpendLog rows, successfulRequests counts RequestLog
    // rows. They are different tables on purpose: a request that never reached
    // a provider costs nothing and must not dilute cost-per-request.
    const window: RawMetrics = {
      totalCost: toNumber(row.cost),
      totalTokens: toNumber(row.tokens),
      totalRequests: Number(row.requests),
      successfulRequests: Number(row.successes),
      totalLatencyMs: toNumber(row.latency_ms),
      cachedCostAvoided: toNumber(row.cached_cost),
    };

    if (row.is_current) entry.current = window;
    else entry.previous = window;

    byAgent.set(row.agent_id, entry);
  }

  return [...byAgent.values()];
}

/** Pure scoring: no I/O, so the weights stay easy to reason about and test. */
function score(current: RawMetrics, previous: RawMetrics): EfficiencyMetrics {
  if (current.totalRequests === 0) return NO_DATA;

  const costPerKTokens =
    current.totalTokens > 0 ? (current.totalCost / current.totalTokens) * 1000 : 0;
  const tokensPerRequest = current.totalTokens / current.totalRequests;
  const costPerRequest = current.totalCost / current.totalRequests;
  const successRate = current.successfulRequests / current.totalRequests;
  const latencyPer100Tokens =
    current.totalTokens > 0 ? current.totalLatencyMs / (current.totalTokens / 100) : 0;

  // Weighted scoring (each 0–100)
  const costScore = Math.max(0, 100 - costPerKTokens * 500); // $0.02/1K = 90, $0.20/1K = 0
  const successScore = successRate * 100;
  const latencyScore = Math.max(0, 100 - latencyPer100Tokens / 10); // <1000ms/100tok = 100
  const cacheScore = Math.min(
    100,
    (current.cachedCostAvoided / Math.max(current.totalCost, 0.001)) * 100,
  );

  // Overall score: cost matters most
  const overall = Math.round(
    costScore * 0.4 + successScore * 0.3 + latencyScore * 0.2 + cacheScore * 0.1,
  );

  const grade = scoreToGrade(overall);

  return {
    score: overall,
    costPerKTokens: Math.round(costPerKTokens * 1000) / 1000,
    tokensPerRequest: Math.round(tokensPerRequest),
    costPerRequest: Math.round(costPerRequest * 10000) / 10000,
    successRate: Math.round(successRate * 1000) / 10,
    cacheAvoidancePercent: Math.round(cacheScore * 10) / 10,
    latencyPer100Tokens: Math.round(latencyPer100Tokens),
    trend: determineTrend(current, previous),
    grade,
    summary: SUMMARIES[grade] ?? SUMMARIES.C,
  };
}

const SUMMARIES: Record<string, string> = {
  "A+": "World-class efficiency. This agent is a model for your team.",
  A: "Excellent efficiency. Well-optimized and reliable.",
  B: "Good efficiency. Minor optimizations available.",
  C: "Average efficiency. Review prompt engineering and model choice.",
  D: "Below average. Significant waste detected.",
  F: "Critical inefficiency. Immediate intervention required.",
  "N/A": "No data available yet.",
};

function scoreToGrade(value: number): string {
  if (value >= 95) return "A+";
  if (value >= 85) return "A";
  if (value >= 70) return "B";
  if (value >= 55) return "C";
  if (value >= 40) return "D";
  return "F";
}

function determineTrend(
  current: RawMetrics,
  previous: RawMetrics,
): "improving" | "stable" | "degrading" {
  if (previous.totalRequests === 0 || current.totalRequests === 0) return "stable";

  const prevCostPerReq = previous.totalCost / previous.totalRequests;
  const currCostPerReq = current.totalCost / current.totalRequests;
  const prevSuccess = previous.successfulRequests / previous.totalRequests;
  const currSuccess = current.successfulRequests / current.totalRequests;

  const costDelta = (prevCostPerReq - currCostPerReq) / prevCostPerReq;
  const successDelta = currSuccess - prevSuccess;

  const composite = costDelta * 0.6 + successDelta * 0.4;
  if (composite > 0.05) return "improving";
  if (composite < -0.05) return "degrading";
  return "stable";
}

export async function calculateEfficiency(
  agentId: string,
  organizationId: string,
  days = 7,
): Promise<EfficiencyMetrics> {
  const [agent] = await fetchAgentWindows(organizationId, days, agentId);
  // No row means the agent does not belong to this organization, or does not
  // exist. Either way the caller gets "no data", never another org's numbers.
  return agent ? score(agent.current, agent.previous) : NO_DATA;
}

/** Efficiency leaderboard across all agents in an organization */
export async function efficiencyLeaderboard(
  organizationId: string,
  days = 7,
): Promise<Array<{ agentId: string; agentName: string; score: number; grade: string; trend: string }>> {
  const agents = await fetchAgentWindows(organizationId, days);

  return agents
    .map((agent) => {
      const metrics = score(agent.current, agent.previous);
      return {
        agentId: agent.agentId,
        agentName: agent.agentName,
        score: metrics.score,
        grade: metrics.grade,
        trend: metrics.trend,
      };
    })
    .sort((a, b) => b.score - a.score);
}
