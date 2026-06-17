/**
 * WHOAI Agent Efficiency Score
 * Measures cost-per-outcome, not just cost-per-request.
 * An agent that spends $0.10 to generate $100 of value is efficient.
 * An agent that spends $5.00 to generate $0 of value is wasteful.
 *
 * This is a category-defining metric — no competitor tracks
 * cost efficiency at the agent level.
 */

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

export async function calculateEfficiency(
  agentId: string,
  organizationId: string,
  days = 7
): Promise<EfficiencyMetrics> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [current, previous] = await Promise.all([
    fetchRawMetrics(agentId, organizationId, since),
    fetchRawMetrics(
      agentId,
      organizationId,
      new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000),
      since
    ),
  ]);

  if (current.totalRequests === 0) {
    return {
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
  }

  const costPerKTokens =
    current.totalTokens > 0 ? (current.totalCost / current.totalTokens) * 1000 : 0;
  const tokensPerRequest = current.totalTokens / current.totalRequests;
  const costPerRequest = current.totalCost / current.totalRequests;
  const successRate = current.totalRequests > 0 ? current.successfulRequests / current.totalRequests : 0;
  const latencyPer100Tokens =
    current.totalTokens > 0 ? current.totalLatencyMs / (current.totalTokens / 100) : 0;

  // Weighted scoring (each 0–100)
  const costScore = Math.max(0, 100 - costPerKTokens * 500); // $0.20/1K = 100, $0.50/1K = 0
  const successScore = successRate * 100;
  const latencyScore = Math.max(0, 100 - latencyPer100Tokens / 10); // <1000ms/100tok = 100
  const cacheScore = Math.min(100, (current.cachedCostAvoided / Math.max(current.totalCost, 0.001)) * 100);

  // Overall score: cost matters most
  const score = Math.round(
    costScore * 0.4 + successScore * 0.3 + latencyScore * 0.2 + cacheScore * 0.1
  );

  const grade = scoreToGrade(score);
  const trend = determineTrend(current, previous);

  const summaries: Record<string, string> = {
    "A+": "World-class efficiency. This agent is a model for your team.",
    A: "Excellent efficiency. Well-optimized and reliable.",
    B: "Good efficiency. Minor optimizations available.",
    C: "Average efficiency. Review prompt engineering and model choice.",
    D: "Below average. Significant waste detected.",
    F: "Critical inefficiency. Immediate intervention required.",
    "N/A": "No data available yet.",
  };

  return {
    score,
    costPerKTokens: Math.round(costPerKTokens * 1000) / 1000,
    tokensPerRequest: Math.round(tokensPerRequest),
    costPerRequest: Math.round(costPerRequest * 10000) / 10000,
    successRate: Math.round(successRate * 1000) / 10,
    cacheAvoidancePercent: Math.round(cacheScore * 10) / 10,
    latencyPer100Tokens: Math.round(latencyPer100Tokens),
    trend,
    grade,
    summary: summaries[grade] || summaries.C,
  };
}

async function fetchRawMetrics(
  agentId: string,
  organizationId: string,
  since: Date,
  until?: Date
): Promise<RawMetrics> {
  // SpendLog tracks cost + tokens. RequestLog tracks latency + status.
  const [spendRows, requestRows] = await Promise.all([
    prisma.spendLog.findMany({
      where: {
        agentId,
        organizationId,
        createdAt: { gte: since, ...(until ? { lt: until } : {}) },
      },
      select: {
        cost: true,
        tokensIn: true,
        tokensOut: true,
        metadata: true,
      },
    }),
    prisma.requestLog.findMany({
      where: {
        agentId,
        organizationId,
        timestamp: { gte: since, ...(until ? { lt: until } : {}) },
      },
      select: {
        statusCode: true,
        latencyMs: true,
      },
    }),
  ]);

  let totalCost = 0;
  let totalTokens = 0;
  let successfulRequests = 0;
  let totalLatencyMs = 0;
  let cachedCostAvoided = 0;

  for (const row of spendRows) {
    const cost =
      typeof row.cost === "number"
        ? row.cost
        : (row.cost as unknown as { toNumber: () => number }).toNumber();
    totalCost += cost;
    totalTokens += row.tokensIn + row.tokensOut;
    // Check metadata for cached flag
    const meta = row.metadata as Record<string, unknown> | null;
    if (meta?.cached === true) cachedCostAvoided += cost;
  }

  for (const row of requestRows) {
    if ((row.statusCode ?? 200) < 400) successfulRequests++;
    totalLatencyMs += row.latencyMs ?? 0;
  }

  return {
    totalCost,
    totalTokens,
    totalRequests: spendRows.length,
    successfulRequests,
    totalLatencyMs,
    cachedCostAvoided,
  };
}

function scoreToGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

function determineTrend(current: RawMetrics, previous: RawMetrics): "improving" | "stable" | "degrading" {
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

/** Efficiency leaderboard across all agents in an organization */
export async function efficiencyLeaderboard(
  organizationId: string,
  days = 7
): Promise<Array<{ agentId: string; agentName: string; score: number; grade: string; trend: string }>> {
  const agents = await prisma.agent.findMany({
    where: { organizationId },
    select: { id: true, name: true },
  });

  const results = await Promise.all(
    agents.map(async (agent) => {
      const metrics = await calculateEfficiency(agent.id, organizationId, days);
      return {
        agentId: agent.id,
        agentName: agent.name ?? "Unnamed agent",
        score: metrics.score,
        grade: metrics.grade,
        trend: metrics.trend,
      };
    })
  );

  return results.sort((a, b) => b.score - a.score);
}
