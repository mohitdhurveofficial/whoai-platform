import { NextResponse } from "next/server";

/**
 * Fixed-window rate limiting for public and abuse-prone endpoints.
 *
 * Two backends, chosen at call time:
 *
 *   - Upstash Redis (when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are
 *     set) — shared across every serverless instance, so the limit is a real
 *     limit. One pipelined round trip per check.
 *   - An in-process Map otherwise — correct on a single node, and on a
 *     multi-instance deploy it degrades to "limit × instance count" rather than
 *     to nothing. That is a meaningful speed bump against credential stuffing
 *     and a useless one against a distributed attacker; configure Redis in
 *     production.
 *
 * Failures are open. A limiter that 500s when Redis hiccups would take the
 * login page down with it, which is a worse outcome than briefly unmetered
 * requests.
 */

export interface RateLimitRule {
  /** Requests permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Epoch milliseconds at which the window rolls over. */
  resetAt: number;
  /** Whole seconds until the window rolls over, for the Retry-After header. */
  retryAfterSeconds: number;
}

/** Shared presets, so limits live in one place rather than in each route. */
export const RATE_LIMITS = {
  /** Password login. Tight — a human retries a typo a handful of times. */
  login: { limit: 8, windowMs: 60_000 },
  /** Account creation. Slow by nature; anything faster is a script. */
  signup: { limit: 5, windowMs: 60 * 60_000 },
  /** Password reset. Every hit sends an email to someone else's inbox. */
  passwordReset: { limit: 4, windowMs: 60 * 60_000 },
  /** Invitations. Also sends mail, but to addresses an admin chose. */
  invite: { limit: 20, windowMs: 60 * 60_000 },
  /** Marketing form submissions. */
  lead: { limit: 5, windowMs: 60 * 60_000 },
} as const satisfies Record<string, RateLimitRule>;

// ---------------------------------------------------------------------------
// In-process backend
// ---------------------------------------------------------------------------

type Bucket = { count: number; resetAt: number };

// Module state survives across requests within one warm instance, which is the
// entire point; on a cold start the window simply begins again.
const buckets = new Map<string, Bucket>();

// A cap so a flood of distinct keys (one per spoofed IP) cannot grow the map
// without bound. Expired entries are dropped first; if that is not enough the
// oldest are evicted, which can only ever be permissive.
const MAX_BUCKETS = 10_000;

function pruneBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size <= MAX_BUCKETS) return;
  const overflow = buckets.size - MAX_BUCKETS;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (++removed >= overflow) break;
  }
}

function checkInMemory(key: string, rule: RateLimitRule, now: number): RateLimitResult {
  pruneBuckets(now);

  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + rule.windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  return toResult(bucket.count, bucket.resetAt, rule, now);
}

// ---------------------------------------------------------------------------
// Upstash Redis backend
// ---------------------------------------------------------------------------

/**
 * INCR the counter and, only if the key is new, stamp an expiry — all in one
 * pipelined round trip. PEXPIRE ... NX is what makes the window fixed rather
 * than sliding forward on every request.
 */
async function checkRedis(
  url: string,
  token: string,
  key: string,
  rule: RateLimitRule,
  now: number,
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`;
  const res = await fetch(`${url.replace(/\/+$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["PEXPIRE", redisKey, String(rule.windowMs), "NX"],
      ["PTTL", redisKey],
    ]),
    // Never let the limiter outlast the request it is protecting.
    signal: AbortSignal.timeout(1_500),
  });

  if (!res.ok) throw new Error(`upstash responded ${res.status}`);

  const body = (await res.json()) as Array<{ result?: unknown; error?: string }>;
  const count = Number(body[0]?.result);
  const ttl = Number(body[2]?.result);
  if (!Number.isFinite(count)) throw new Error("upstash returned no counter");

  // A negative TTL means the key exists without an expiry (a race lost the
  // PEXPIRE NX); fall back to a full window so it is guaranteed to clear.
  const resetAt = now + (Number.isFinite(ttl) && ttl > 0 ? ttl : rule.windowMs);
  return toResult(count, resetAt, rule, now);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function toResult(count: number, resetAt: number, rule: RateLimitRule, now: number): RateLimitResult {
  return {
    allowed: count <= rule.limit,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - count),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

function allowResult(rule: RateLimitRule, now: number): RateLimitResult {
  return {
    allowed: true,
    limit: rule.limit,
    remaining: rule.limit,
    resetAt: now + rule.windowMs,
    retryAfterSeconds: 0,
  };
}

/**
 * Count one hit against `key` and report whether it is permitted.
 *
 * `key` should identify the actor as precisely as the route can manage —
 * `login:ip:1.2.3.4` and `login:email:a@b.com` are different keys and both are
 * worth checking, because either alone leaves an obvious hole.
 */
export async function checkRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const now = Date.now();
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      return await checkRedis(url, token, key, rule, now);
    } catch (error) {
      // Fail open, but say so — a limiter silently doing nothing is the worst
      // of both worlds.
      const { reportError } = await import("@/lib/observability/report");
      await reportError(error, { source: "rate-limit:upstash", extra: { key } });
      return allowResult(rule, now);
    }
  }

  return checkInMemory(key, rule, now);
}

/** Headers describing the current window, for both allowed and denied replies. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

/** The 429 to return when `checkRateLimit` denies. */
export function rateLimitResponse(result: RateLimitResult, message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message ?? "Too many requests. Please wait a moment and try again.",
      retryAfter: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        ...rateLimitHeaders(result),
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}

/**
 * Best-effort client IP.
 *
 * x-forwarded-for is client-controlled unless a trusted proxy overwrites it;
 * Vercel and Render both do. The leftmost entry is the original client. When
 * there is no header at all we return a constant, which buckets every such
 * request together — deliberately conservative.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Exposed for tests; clears the in-process buckets. */
export function __resetRateLimitStore() {
  buckets.clear();
}
