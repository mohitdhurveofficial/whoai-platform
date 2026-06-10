// CORS + lightweight rate limiting for the public API gateway (/api/v1/*).
//
// These endpoints are authenticated with a Bearer API key, so the allowed
// origin is configurable (GATEWAY_ALLOWED_ORIGIN) and defaults to "*" only for
// server-to-server use. Browser callers from a known dashboard origin should
// set GATEWAY_ALLOWED_ORIGIN to that origin.

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.GATEWAY_ALLOWED_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-agent-id",
  "Access-Control-Max-Age": "86400",
};

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// JSON response that always carries the CORS headers, so browser clients can
// read both success and error bodies from the gateway.
export function corsJson(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> },
): Response {
  return Response.json(body, {
    status: init?.status ?? 200,
    headers: { ...corsHeaders, ...(init?.headers ?? {}) },
  });
}

// Best-effort in-memory token bucket, keyed by API key. On serverless this is
// per-instance (not global), so it caps a single hot instance rather than the
// whole fleet — a cheap first line of defense against a leaked/abused key. For
// strict global limits, back this with Redis/Upstash later.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = Number(process.env.GATEWAY_RATE_LIMIT_PER_MIN ?? 120);

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(identifier: string): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  const existing = buckets.get(identifier);

  if (!existing || now >= existing.resetAt) {
    buckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}
