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

const skipReason = process.env.SKIP_MIGRATIONS === "1"
  ? "SKIP_MIGRATIONS=1"
  : !(process.env.DIRECT_URL || process.env.DATABASE_URL)
    ? "no DATABASE_URL/DIRECT_URL in the environment"
    : null;

if (skipReason) {
  console.log(`[migrate-deploy] skipped — ${skipReason}.`);
  process.exit(0);
}

console.log("[migrate-deploy] applying pending migrations…");
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  console.error("[migrate-deploy] migration failed — aborting build.");
  process.exit(result.status ?? 1);
}
console.log("[migrate-deploy] database is up to date.");
