import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reportError } from "@/lib/observability/report";

const DSN = "https://publickey123@o4507.ingest.us.sentry.io/4509876";

describe("reportError", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.SENTRY_DSN;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SENTRY_DSN;
  });

  it("always emits one structured JSON line, even with no DSN configured", async () => {
    await reportError(new TypeError("boom"), { source: "route:/api/agents" });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(logged).toMatchObject({
      level: "error",
      service: "control-plane",
      source: "route:/api/agents",
      error: "TypeError",
      message: "boom",
    });
    expect(logged.timestamp).toBeTypeOf("string");
  });

  it("redacts credential-bearing keys from extra", async () => {
    await reportError(new Error("x"), {
      extra: { authorization: "Bearer sk-live-secret", agentId: "agent_1" },
    });

    const logged = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(logged.extra.authorization).toBe("[redacted]");
    expect(logged.extra.agentId).toBe("agent_1");
  });

  it("posts a Sentry envelope when SENTRY_DSN is set", async () => {
    process.env.SENTRY_DSN = DSN;
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await reportError(new Error("kaboom"), {
      source: "cron:reset-budgets",
      request: { path: "/api/cron/reset-budgets", method: "POST", headers: { cookie: "session=abc" } },
      organizationId: "org_1",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://o4507.ingest.us.sentry.io/api/4509876/envelope/?sentry_key=publickey123&sentry_version=7",
    );
    expect(init.method).toBe("POST");

    // Envelope is three newline-delimited JSON objects: header, item header, payload.
    const [header, itemHeader, payload] = (init.body as string).split("\n").map((l: string) => JSON.parse(l));
    expect(header.event_id).toMatch(/^[0-9a-f]{32}$/);
    expect(itemHeader).toEqual({ type: "event" });
    expect(payload.exception.values[0]).toMatchObject({ type: "Error", value: "kaboom" });
    expect(payload.tags.route).toBe("/api/cron/reset-budgets");
    expect(payload.extra.organizationId).toBe("org_1");
    expect(payload.extra.headers.cookie).toBe("[redacted]");
  });

  it("never throws when the Sentry transport fails", async () => {
    process.env.SENTRY_DSN = DSN;
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(reportError(new Error("original"))).resolves.toBeUndefined();
    // The structured log still recorded the original error.
    const logged = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(logged.message).toBe("original");
  });

  it("degrades to log-only on a malformed DSN instead of throwing", async () => {
    process.env.SENTRY_DSN = "not-a-dsn";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(reportError(new Error("y"))).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handles a thrown non-Error value", async () => {
    await reportError("just a string");

    const logged = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(logged.error).toBe("NonError");
    expect(logged.message).toBe("just a string");
  });
});
