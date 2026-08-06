import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, normalizeTier, type PlanType } from "@/lib/subscription";

// Every plan sells a telemetry retention window (plans.json → retentionDays),
// but nothing ever deleted anything: Free advertised 7 days and kept rows
// forever. That made the retention line on the pricing page untrue, removed a
// real reason to upgrade, and grew the telemetry tables without bound.
//
// This job deletes per-organization telemetry older than that org's plan
// window. DELETION IS PERMANENT — there is no soft-delete or archive. Verify
// against `?dryRun=1` (which counts without deleting) before scheduling it.
//
// Scope is deliberately limited to raw, high-volume events: SpendLog,
// RequestLog and ActivityLog. Two things are intentionally NOT expired:
//   · UsageMetrics — the daily rollup, one row per agent per day. Keeping it is
//     what lets a Free org still see its long-run spend trend after the raw
//     events age out, and getUsageSummary already falls back to it. Expiring
//     rollups on the same window would blank the dashboard, not just the drill-down.
//   · Alert / BudgetViolation — low-volume audit records a customer may need
//     long after the window closes.

export const dynamic = "force-dynamic";

// Rows per table, per tier, per run. Bounds both the transaction size and the
// blast radius of a misconfigured schedule; a backlog drains over several runs.
const BATCH = 5_000;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed when unconfigured
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  return run(req);
}

// Allow GET so platform cron schedulers that only issue GET still work.
export async function GET(req: Request) {
  return run(req);
}

/** The raw-event tables subject to retention, and the column that dates them. */
const TARGETS = [
  { table: "spendLog", dateField: "createdAt" },
  { table: "requestLog", dateField: "timestamp" },
  { table: "activityLog", dateField: "timestamp" },
] as const;

async function run(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";

  // Resolve every org's plan once, then bucket by tier so each retention window
  // is a single scoped query rather than one per organization.
  const organizations = await prisma.organization.findMany({
    select: { id: true, subscriptionTier: true },
  });

  const orgIdsByTier = new Map<PlanType, string[]>();
  for (const org of organizations) {
    const tier = normalizeTier(org.subscriptionTier);
    const bucket = orgIdsByTier.get(tier);
    if (bucket) bucket.push(org.id);
    else orgIdsByTier.set(tier, [org.id]);
  }

  const deleted: Record<string, number> = {};
  const windows: Record<string, string> = {};
  let capped = false;

  for (const [tier, orgIds] of orgIdsByTier) {
    const days = PLAN_LIMITS[tier].retentionDays;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    windows[tier] = `${days}d (before ${cutoff.toISOString()})`;

    for (const { table, dateField } of TARGETS) {
      // `table` and `dateField` are compile-time constants from TARGETS, not
      // user input — this indirection only avoids four near-identical blocks.
      const model = prisma[table] as unknown as {
        findMany(args: unknown): Promise<Array<{ id: string }>>;
        deleteMany(args: unknown): Promise<{ count: number }>;
        count(args: unknown): Promise<number>;
      };
      const where = {
        organizationId: { in: orgIds },
        [dateField]: { lt: cutoff },
      };
      const key = `${tier}.${table}`;

      if (dryRun) {
        deleted[key] = await model.count({ where });
        continue;
      }

      // Select a bounded page of ids first, then delete exactly those:
      // deleteMany has no `take`, so an unbounded call could try to remove
      // millions of rows in one statement.
      const doomed = await model.findMany({ where, select: { id: true }, take: BATCH });
      if (doomed.length === 0) {
        deleted[key] = 0;
        continue;
      }
      const result = await model.deleteMany({
        where: { id: { in: doomed.map((row) => row.id) } },
      });
      deleted[key] = result.count;
      if (doomed.length === BATCH) capped = true;
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    windows,
    deleted,
    // True when at least one table hit the per-run cap, i.e. rows remain beyond
    // the window and the next scheduled run will continue draining them.
    capped,
  });
}
