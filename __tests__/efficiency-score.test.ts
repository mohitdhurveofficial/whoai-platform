import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = { $queryRaw: vi.fn() };
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@prisma/client", () => ({ Prisma: { Decimal: class Decimal {} } }));

const { calculateEfficiency, efficiencyLeaderboard } = await import("@/lib/efficiency-score");

/** One row of the two-per-agent shape the batched query returns. */
function window(
  agentId: string,
  agentName: string,
  isCurrent: boolean,
  values: Partial<{ requests: number; cost: number; tokens: number; cached: number; successes: number; latency: number }> = {},
) {
  return {
    agent_id: agentId,
    agent_name: agentName,
    is_current: isCurrent,
    requests: BigInt(values.requests ?? 0),
    cost: values.cost ?? 0,
    tokens: BigInt(values.tokens ?? 0),
    cached_cost: values.cached ?? 0,
    successes: BigInt(values.successes ?? 0),
    latency_ms: BigInt(values.latency ?? 0),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("calculateEfficiency", () => {
  it("asks the database once for both comparison windows", async () => {
    // Four queries per agent through PgBouncer's single connection was the
    // reason the dashboard crawled. One agent must cost one round trip.
    prisma.$queryRaw.mockResolvedValue([
      window("a1", "Bot", true, { requests: 100, cost: 10, tokens: 100_000, successes: 100, latency: 50_000 }),
      window("a1", "Bot", false),
    ]);

    await calculateEfficiency("a1", "org-1", 7);

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("scores a cheap, reliable, fast agent highly", async () => {
    prisma.$queryRaw.mockResolvedValue([
      // $0.02 per 1K tokens, every request a 200, 50ms per 100 tokens.
      window("a1", "Bot", true, { requests: 100, cost: 2, tokens: 100_000, successes: 100, latency: 50_000 }),
      window("a1", "Bot", false),
    ]);

    const metrics = await calculateEfficiency("a1", "org-1", 7);

    expect(metrics.costPerKTokens).toBe(0.02);
    expect(metrics.successRate).toBe(100);
    expect(metrics.grade).toBe("A");
    expect(metrics.score).toBe(85);
  });

  it("punishes an expensive, failing agent", async () => {
    prisma.$queryRaw.mockResolvedValue([
      window("a1", "Bot", true, { requests: 100, cost: 200, tokens: 100_000, successes: 20, latency: 900_000 }),
      window("a1", "Bot", false),
    ]);

    const metrics = await calculateEfficiency("a1", "org-1", 7);

    expect(metrics.grade).toBe("F");
    expect(metrics.successRate).toBe(20);
  });

  it("reports no data rather than a zero score when nothing was spent", async () => {
    // A brand-new agent has not earned an F. Grading it one would be a lie the
    // customer acts on.
    prisma.$queryRaw.mockResolvedValue([window("a1", "Bot", true), window("a1", "Bot", false)]);

    const metrics = await calculateEfficiency("a1", "org-1", 7);

    expect(metrics.grade).toBe("N/A");
    expect(metrics.trend).toBe("stable");
  });

  it("returns no data for an agent outside the caller's organization", async () => {
    // The query filters on organizationId, so a foreign agent yields no rows.
    prisma.$queryRaw.mockResolvedValue([]);

    expect((await calculateEfficiency("someone-elses-agent", "org-1", 7)).grade).toBe("N/A");
  });

  it("calls the previous window improving when cost per request falls", async () => {
    prisma.$queryRaw.mockResolvedValue([
      window("a1", "Bot", true, { requests: 100, cost: 10, tokens: 100_000, successes: 100, latency: 50_000 }),
      window("a1", "Bot", false, { requests: 100, cost: 40, tokens: 100_000, successes: 100, latency: 50_000 }),
    ]);

    expect((await calculateEfficiency("a1", "org-1", 7)).trend).toBe("improving");
  });

  it("calls it degrading when cost per request climbs", async () => {
    prisma.$queryRaw.mockResolvedValue([
      window("a1", "Bot", true, { requests: 100, cost: 40, tokens: 100_000, successes: 100, latency: 50_000 }),
      window("a1", "Bot", false, { requests: 100, cost: 10, tokens: 100_000, successes: 100, latency: 50_000 }),
    ]);

    expect((await calculateEfficiency("a1", "org-1", 7)).trend).toBe("degrading");
  });
});

describe("efficiencyLeaderboard", () => {
  it("scores every agent from one query, best first", async () => {
    prisma.$queryRaw.mockResolvedValue([
      window("a1", "Cheap", true, { requests: 100, cost: 10, tokens: 100_000, successes: 100, latency: 50_000 }),
      window("a1", "Cheap", false),
      window("a2", "Costly", true, { requests: 100, cost: 200, tokens: 100_000, successes: 20, latency: 900_000 }),
      window("a2", "Costly", false),
    ]);

    const board = await efficiencyLeaderboard("org-1", 7);

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(board.map((row) => row.agentName)).toEqual(["Cheap", "Costly"]);
    expect(board[0].score).toBeGreaterThan(board[1].score);
  });

  it("still lists an agent that has never been used", async () => {
    // Dropping idle agents would quietly hide the ones worth deleting.
    prisma.$queryRaw.mockResolvedValue([window("a1", "Idle", true), window("a1", "Idle", false)]);

    const board = await efficiencyLeaderboard("org-1", 7);

    expect(board).toHaveLength(1);
    expect(board[0]).toMatchObject({ agentId: "a1", agentName: "Idle", grade: "N/A", score: 0 });
  });

  it("falls back to a placeholder name rather than rendering null", async () => {
    prisma.$queryRaw.mockResolvedValue([
      { ...window("a1", "x", true), agent_name: null },
      { ...window("a1", "x", false), agent_name: null },
    ]);

    expect((await efficiencyLeaderboard("org-1", 7))[0].agentName).toBe("Unnamed agent");
  });
});
