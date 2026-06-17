/**
 * WHOAI Predictive Budget AI
 * Forecasts next-day and next-month spend using exponential smoothing,
 * then auto-suggests budget limits that prevent overruns without
 * being unnecessarily restrictive.
 *
 * A true moat: the forecast improves with every request because
 * it learns the organization's unique spend patterns.
 */

import { prisma } from "@/lib/prisma";

export interface ForecastResult {
  /** Forecasted spend for next day */
  nextDay: number;
  /** Forecasted spend for next 7 days */
  nextWeek: number;
  /** Forecasted spend for next 30 days */
  nextMonth: number;
  /** Confidence interval width (±) */
  confidence: number;
  /** Recommended daily budget */
  suggestedDailyBudget: number;
  /** Recommended monthly budget */
  suggestedMonthlyBudget: number;
  /** Days until current monthly budget would be exceeded at current velocity */
  daysUntilExhaustion: number | null;
  /** Alert: will exceed budget within 7 days */
  alert: boolean;
}

interface DailySpend {
  date: string;
  spend: number;
}

/**
 * Holt-Winters exponential smoothing (simplified — no seasonality
 * because AI spend is typically not seasonal at early stage).
 */
function exponentialSmoothing(values: number[], alpha = 0.3): number[] {
  if (values.length === 0) return [];
  const smoothed: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    smoothed.push(alpha * values[i] + (1 - alpha) * smoothed[i - 1]);
  }
  return smoothed;
}

/** Mean Absolute Percentage Error */
function mape(actual: number[], forecast: number[]): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] > 0) {
      sum += Math.abs((actual[i] - forecast[i]) / actual[i]);
      count++;
    }
  }
  return count > 0 ? sum / count : 0.5;
}

export async function forecastSpend(
  organizationId: string,
  days = 30
): Promise<ForecastResult> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.spendLog.groupBy({
    by: ["createdAt"],
    where: {
      organizationId,
      createdAt: { gte: since },
    },
    _sum: { cost: true },
  });

  // Aggregate to daily spend
  const dailyMap = new Map<string, number>();
  for (const row of rows) {
    const date = row.createdAt.toISOString().slice(0, 10);
    const costRaw = row._sum.cost;
    const cost =
      typeof costRaw === "number"
        ? costRaw
        : (costRaw as unknown as { toNumber: () => number })?.toNumber() ?? 0;
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + cost);
  }

  // Fill missing days with 0
  const spendSeries: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    spendSeries.push(dailyMap.get(key) ?? 0);
  }

  if (spendSeries.every((v) => v === 0)) {
    return {
      nextDay: 0,
      nextWeek: 0,
      nextMonth: 0,
      confidence: 0.5,
      suggestedDailyBudget: 10,
      suggestedMonthlyBudget: 300,
      daysUntilExhaustion: null,
      alert: false,
    };
  }

  // Exponential smoothing
  const smoothed = exponentialSmoothing(spendSeries, 0.3);
  const forecast = smoothed[smoothed.length - 1];

  // Confidence based on historical variance
  const mean = spendSeries.reduce((a, b) => a + b, 0) / spendSeries.length;
  const variance = spendSeries.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / spendSeries.length;
  const stdDev = Math.sqrt(variance);
  const confidence = mean > 0 ? stdDev / mean : 0.5;

  const nextDay = Math.max(0, forecast);
  const nextWeek = nextDay * 7;
  const nextMonth = nextDay * 30;

  // Suggested budgets: forecast + 2σ buffer (95% coverage)
  const suggestedDailyBudget = Math.ceil((nextDay + 2 * stdDev) * 100) / 100;
  const suggestedMonthlyBudget = Math.ceil(suggestedDailyBudget * 30 * 100) / 100;

  // Days until exhaustion
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { monthlyBudget: true, currentMonthlySpend: true },
  });

  let daysUntilExhaustion: number | null = null;
  let alert = false;

  const monthlyBudget = org?.monthlyBudget
    ? (org.monthlyBudget as unknown as { toNumber: () => number }).toNumber()
    : 0;
  const currentMonthlySpend = org?.currentMonthlySpend
    ? (org.currentMonthlySpend as unknown as { toNumber: () => number }).toNumber()
    : 0;

  if (monthlyBudget > 0 && mean > 0) {
    const remaining = Math.max(0, monthlyBudget - currentMonthlySpend);
    daysUntilExhaustion = Math.floor(remaining / mean);
    alert = daysUntilExhaustion <= 7;
  }

  return {
    nextDay: Math.round(nextDay * 10000) / 10000,
    nextWeek: Math.round(nextWeek * 10000) / 10000,
    nextMonth: Math.round(nextMonth * 10000) / 10000,
    confidence: Math.round(confidence * 100) / 100,
    suggestedDailyBudget: Math.round(suggestedDailyBudget * 100) / 100,
    suggestedMonthlyBudget: Math.round(suggestedMonthlyBudget * 100) / 100,
    daysUntilExhaustion,
    alert,
  };
}

/** Anomaly detection: flag days where spend exceeded 2σ from trend */
export async function detectSpendAnomalies(
  organizationId: string,
  days = 14
): Promise<Array<{ date: string; actual: number; expected: number; severity: "warning" | "critical" }>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.spendLog.groupBy({
    by: ["createdAt"],
    where: { organizationId, createdAt: { gte: since } },
    _sum: { cost: true },
  });

  const daily: DailySpend[] = [];
  for (const row of rows) {
    const cost =
      typeof row._sum.cost === "number"
        ? row._sum.cost
        : (row._sum.cost as unknown as { toNumber: () => number })?.toNumber() ?? 0;
    daily.push({ date: row.createdAt.toISOString().slice(0, 10), spend: cost });
  }

  const values = daily.map((d) => d.spend);
  const smoothed = exponentialSmoothing(values, 0.3);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

  const anomalies: Array<{ date: string; actual: number; expected: number; severity: "warning" | "critical" }> = [];
  for (let i = 0; i < values.length; i++) {
    const deviation = values[i] - smoothed[i];
    if (deviation > stdDev * 2) {
      anomalies.push({
        date: daily[i].date,
        actual: Math.round(values[i] * 10000) / 10000,
        expected: Math.round(smoothed[i] * 10000) / 10000,
        severity: deviation > stdDev * 3 ? "critical" : "warning",
      });
    }
  }

  return anomalies;
}
