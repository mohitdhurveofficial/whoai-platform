#!/usr/bin/env node
/**
 * Apply pending Prisma migrations as part of the build.
 *
 * Without this, `npm run build` only ran `prisma generate` — which regenerates
 * the client from schema.prisma but never touches the database. A deploy would
 * therefore ship code referencing columns (e.g. Organization.currentMonthlyRequests,
 * which the gateway writes on every request) that do not exist in production.
 *
 * Skips — rather than fails — when there is no database to talk to, so CI can
 * typecheck and build without provisioning Postgres. When a database IS
 * configured and the migration fails, the build fails: shipping code against an
 * un-migrated schema is worse than not shipping.
 */
import { spawnSync } from "node:child_process";

/**
 * Supabase's direct endpoint (db.<ref>.supabase.co) publishes an AAAA record and
 * no A record — it is reachable over IPv6 only. Vercel's serverless runtime has
 * IPv6, so the app itself queries it happily, but Vercel's *build* containers are
 * IPv4-only. `prisma migrate deploy` therefore dies with:
 *
 *   P1001: Can't reach database server at `db.<ref>.supabase.co:5432`
 *
 * and takes the whole build with it. The symptom looks like a credentials or
 * firewall problem and is neither: the host is simply unroutable from here.
 *
 * Supabase's Supavisor pooler does publish A records, so we rewrite the host at
 * build time. Port 5432 on the pooler is *session* mode, which is what migrations
 * need — port 6543 is transaction mode, and `migrate deploy` cannot run through it
 * (advisory locks and multi-statement DDL transactions don't survive a transaction
 * pooler). The pooler also requires the tenant-qualified username `postgres.<ref>`
 * rather than the bare `postgres`.
 *
 * Set SUPABASE_POOLER_HOST if the project ever moves region; the default is this
 * project's home region. Set SKIP_POOLER_REWRITE=1 to opt out entirely (e.g. when
 * running against a database that is genuinely reachable directly).
 */
const POOLER_HOST =
  process.env.SUPABASE_POOLER_HOST || "aws-1-ap-southeast-2.pooler.supabase.com";

const DIRECT_HOST_RE = /^db\.([a-z0-9]+)\.supabase\.co$/;

function toPoolerSessionUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null; // not a URL we understand — leave it alone
  }

  const match = DIRECT_HOST_RE.exec(url.hostname);
  if (!match) return null; // already pooled, or not Supabase at all

  const ref = match[1];
  // Read .password/.pathname off the parsed URL so any percent-encoding in the
  // password survives verbatim.
  const user = url.username === "postgres" ? `postgres.${ref}` : url.username;
  const db = url.pathname && url.pathname !== "/" ? url.pathname : "/postgres";
  return `postgresql://${user}:${url.password}@${POOLER_HOST}:5432${db}`;
}

const skipReason =
  process.env.SKIP_MIGRATIONS === "1"
    ? "SKIP_MIGRATIONS=1"
    : !(process.env.DIRECT_URL || process.env.DATABASE_URL)
      ? "no DATABASE_URL/DIRECT_URL in the environment"
      : null;

if (skipReason) {
  console.log(`[migrate-deploy] skipped — ${skipReason}.`);
  process.exit(0);
}

const env = { ...process.env };

if (process.env.SKIP_POOLER_REWRITE !== "1") {
  // schema.prisma sets directUrl = env("DIRECT_URL"), so that is the one migrate
  // deploy actually dials; DATABASE_URL is rewritten too so the fallback path
  // (no DIRECT_URL set) gets the same treatment.
  for (const name of ["DIRECT_URL", "DATABASE_URL"]) {
    const rewritten = env[name] && toPoolerSessionUrl(env[name]);
    if (rewritten) {
      env[name] = rewritten;
      console.log(
        `[migrate-deploy] ${name}: rewrote IPv6-only direct host to ${POOLER_HOST}:5432 (session mode).`,
      );
    }
  }
}

console.log("[migrate-deploy] applying pending migrations…");
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  console.error("[migrate-deploy] migration failed — aborting build.");
  process.exit(result.status ?? 1);
}
console.log("[migrate-deploy] database is up to date.");
