import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RUNTIME_READY_URL } from "@/lib/runtime-url";

/**
 * Public status of both planes.
 *
 * The runtime is the only path customer traffic takes, and it is deployed
 * separately from this app — so when it is down, nothing here notices on its
 * own. This endpoint gives support, uptime monitors, and a status page one
 * place to ask, without needing a dashboard session.
 *
 * Deliberately unauthenticated and deliberately thin: it reports reachability,
 * never counts, names, or anything else about a customer.
 */

export const dynamic = "force-dynamic";

// Long enough to survive a cold start on a free-tier dyno, short enough that a
// monitor polling this does not pile up connections against a dead runtime.
const PROBE_TIMEOUT_MS = 5_000;

type Component = {
  status: "ok" | "degraded";
  latencyMs: number | null;
};

async function probe(check: () => Promise<unknown>): Promise<Component> {
  const started = Date.now();
  try {
    await check();
    return { status: "ok", latencyMs: Date.now() - started };
  } catch {
    // The reason is intentionally not returned: connection strings and
    // internal hostnames leak through driver error messages.
    return { status: "degraded", latencyMs: null };
  }
}

export async function GET() {
  const [database, runtime] = await Promise.all([
    probe(() => prisma.$queryRaw`SELECT 1`),
    probe(async () => {
      const response = await fetch(RUNTIME_READY_URL, {
        cache: "no-store",
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      });
      // The runtime answers 503 when it is up but cannot reach Postgres. That
      // is still "not serving traffic", so it counts as degraded.
      if (!response.ok) throw new Error(`runtime returned ${response.status}`);
    }),
  ]);

  const healthy = database.status === "ok" && runtime.status === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      components: { database, runtime },
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
