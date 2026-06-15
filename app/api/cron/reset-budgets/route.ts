import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Spend counters (currentDailySpend / currentMonthlySpend) are only ever
// incremented by the gateway — nothing resets them. Without this job, "daily"
// and "monthly" budgets behave as permanent lifetime caps: once an agent/org
// trips its limit it is auto-paused forever. This endpoint, run on a schedule,
// rolls the counters back to zero and re-activates anything the SYSTEM paused
// purely for a budget breach (manual pauses are left untouched).
//
// Schedule it once per day (UTC). It always resets the daily window, and also
// resets the monthly window on the first of the month. See vercel.json.

export const dynamic = "force-dynamic";

// Pause reasons written by the runtime kill switch (runtime/killswitch).
const DAILY_BUDGET_EXCEEDED = "DAILY_BUDGET_EXCEEDED";
const MONTHLY_BUDGET_EXCEEDED = "MONTHLY_BUDGET_EXCEEDED";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed when unconfigured
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  return run(req);
}

// Allow GET so platform cron schedulers that only issue GET still work.
export async function GET(req: Request) {
  return run(req);
}

async function run(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reset the monthly window on the first of the month (UTC). The optional
  // `?period=` override exists for manual/backfill runs.
  const url = new URL(req.url);
  const periodParam = url.searchParams.get("period");
  const isFirstOfMonth = new Date().getUTCDate() === 1;
  const resetMonthly = periodParam === "monthly" || periodParam === "both" || isFirstOfMonth;
  const resetDaily = periodParam !== "monthly"; // daily unless explicitly monthly-only

  const result: Record<string, number> = {};

  await prisma.$transaction(async (tx) => {
    if (resetDaily) {
      const a = await tx.agent.updateMany({ data: { currentDailySpend: 0 } });
      const o = await tx.organization.updateMany({ data: { currentDailySpend: 0 } });
      // Re-activate only what the system auto-paused for a DAILY budget breach.
      const ar = await tx.agent.updateMany({
        where: { status: "PAUSED", pausedBy: "SYSTEM", pauseReason: DAILY_BUDGET_EXCEEDED },
        data: { status: "ACTIVE", pauseReason: null, pausedAt: null, pausedBy: null },
      });
      const or = await tx.organization.updateMany({
        where: { status: "PAUSED", pauseReason: DAILY_BUDGET_EXCEEDED },
        data: { status: "ACTIVE", pauseReason: null, pausedAt: null },
      });
      result.agentsDailyReset = a.count;
      result.orgsDailyReset = o.count;
      result.agentsDailyResumed = ar.count;
      result.orgsDailyResumed = or.count;
    }

    if (resetMonthly) {
      const a = await tx.agent.updateMany({ data: { currentMonthlySpend: 0 } });
      const o = await tx.organization.updateMany({ data: { currentMonthlySpend: 0 } });
      const ar = await tx.agent.updateMany({
        where: { status: "PAUSED", pausedBy: "SYSTEM", pauseReason: MONTHLY_BUDGET_EXCEEDED },
        data: { status: "ACTIVE", pauseReason: null, pausedAt: null, pausedBy: null },
      });
      const or = await tx.organization.updateMany({
        where: { status: "PAUSED", pauseReason: MONTHLY_BUDGET_EXCEEDED },
        data: { status: "ACTIVE", pauseReason: null, pausedAt: null },
      });
      result.agentsMonthlyReset = a.count;
      result.orgsMonthlyReset = o.count;
      result.agentsMonthlyResumed = ar.count;
      result.orgsMonthlyResumed = or.count;
    }
  });

  return NextResponse.json({ ok: true, resetDaily, resetMonthly, ...result });
}
