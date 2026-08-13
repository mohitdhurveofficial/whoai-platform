import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetRateLimitStore,
  checkRateLimit,
  clientIp,
  rateLimitHeaders,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

const RULE = { limit: 3, windowMs: 1_000 };

beforeEach(() => {
  __resetRateLimitStore();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("checkRateLimit (in-process)", () => {
  it("allows exactly `limit` requests, then denies", async () => {
    for (let i = 1; i <= RULE.limit; i++) {
      const result = await checkRateLimit("k", RULE);
      expect(result.allowed, `request ${i}`).toBe(true);
      expect(result.remaining).toBe(RULE.limit - i);
    }

    const denied = await checkRateLimit("k", RULE);
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("counts each key independently", async () => {
    for (let i = 0; i < RULE.limit; i++) await checkRateLimit("a", RULE);
    expect((await checkRateLimit("a", RULE)).allowed).toBe(false);
    // Exhausting one IP must not lock out everyone else.
    expect((await checkRateLimit("b", RULE)).allowed).toBe(true);
  });

  it("reopens once the window rolls over", async () => {
    vi.useFakeTimers();
    for (let i = 0; i < RULE.limit; i++) await checkRateLimit("k", RULE);
    expect((await checkRateLimit("k", RULE)).allowed).toBe(false);

    vi.advanceTimersByTime(RULE.windowMs + 1);
    expect((await checkRateLimit("k", RULE)).allowed).toBe(true);
  });
});

describe("checkRateLimit (Upstash)", () => {
  it("pipelines INCR/PEXPIRE/PTTL and denies past the limit", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com/";
    process.env.UPSTASH_REDIS_REST_TOKEN = "tok";

    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify([{ result: 4 }, { result: 1 }, { result: 800 }]), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await checkRateLimit("k", RULE);
    expect(result.allowed).toBe(false);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    // The trailing slash on the configured URL must not produce "//pipeline".
    expect(url).toBe("https://redis.example.com/pipeline");
    expect(JSON.parse(String(init.body))).toEqual([
      ["INCR", "ratelimit:k"],
      ["PEXPIRE", "ratelimit:k", "1000", "NX"],
      ["PTTL", "ratelimit:k"],
    ]);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("fails open when Redis is unreachable", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "tok";
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }));

    // A limiter outage must not take the login page down with it.
    const result = await checkRateLimit("k", RULE);
    expect(result.allowed).toBe(true);
  });

  it("fails open on a non-2xx from Redis", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "tok";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));

    expect((await checkRateLimit("k", RULE)).allowed).toBe(true);
  });
});

describe("rateLimitResponse", () => {
  it("is a 429 carrying Retry-After and the window headers", async () => {
    for (let i = 0; i < RULE.limit; i++) await checkRateLimit("k", RULE);
    const denied = await checkRateLimit("k", RULE);

    const response = rateLimitResponse(denied);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe(String(denied.retryAfterSeconds));
    expect(response.headers.get("X-RateLimit-Limit")).toBe(String(RULE.limit));
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");

    const body = await response.json();
    expect(body).toMatchObject({ success: false, retryAfter: denied.retryAfterSeconds });
  });

  it("exposes reset as epoch seconds, not milliseconds", () => {
    const headers = rateLimitHeaders({
      allowed: true,
      limit: 5,
      remaining: 4,
      resetAt: 1_700_000_000_000,
      retryAfterSeconds: 0,
    });
    expect(headers["X-RateLimit-Reset"]).toBe("1700000000");
  });
});

describe("clientIp", () => {
  it("takes the leftmost x-forwarded-for entry", () => {
    const request = new Request("https://whoai.ai/", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" },
    });
    expect(clientIp(request)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then to a constant", () => {
    expect(
      clientIp(new Request("https://whoai.ai/", { headers: { "x-real-ip": "198.51.100.4" } })),
    ).toBe("198.51.100.4");
    expect(clientIp(new Request("https://whoai.ai/"))).toBe("unknown");
  });
});

describe("RATE_LIMITS presets", () => {
  it("keeps every limit positive and windowed", () => {
    for (const [name, rule] of Object.entries(RATE_LIMITS)) {
      expect(rule.limit, name).toBeGreaterThan(0);
      expect(rule.windowMs, name).toBeGreaterThan(0);
    }
  });
});
