import { beforeEach, describe, expect, it, vi } from "vitest";

// Prisma is mocked before the module under test is imported so no client is
// ever constructed and no connection attempted.
const prisma = { $queryRaw: vi.fn() };
vi.mock("@/lib/prisma", () => ({ prisma }));

const { getOnboardingState } = await import("@/lib/onboarding/checklist");

type Setup = {
  provider?: boolean;
  agent?: boolean;
  request?: boolean;
  budget?: boolean;
};

function stub({ provider = false, agent = false, request = false, budget = false }: Setup) {
  prisma.$queryRaw.mockResolvedValue([
    { has_provider: provider, has_agent: agent, has_request: request, has_budget: budget },
  ]);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOnboardingState", () => {
  it("marks nothing done for a brand-new workspace", async () => {
    stub({});
    const state = await getOnboardingState("org-1");

    expect(state.completedCount).toBe(0);
    expect(state.complete).toBe(false);
    expect(state.steps.every((step) => !step.done)).toBe(true);
    // The first action is always the provider key — without it nothing works.
    expect(state.nextStep?.id).toBe("provider");
  });

  it("completes once all four conditions hold", async () => {
    stub({ provider: true, agent: true, request: true, budget: true });
    const state = await getOnboardingState("org-1");

    expect(state.complete).toBe(true);
    expect(state.completedCount).toBe(4);
    expect(state.nextStep).toBeNull();
  });

  it("advances nextStep past whatever is already done", async () => {
    stub({ provider: true, agent: true });
    const state = await getOnboardingState("org-1");

    expect(state.completedCount).toBe(2);
    expect(state.nextStep?.id).toBe("request");
  });

  it("treats a zero budget as unset, not as a zero allowance", async () => {
    // The kill switch reads 0 as "no limit configured", so the checklist must
    // agree — otherwise we would tell a customer they are protected when the
    // gateway would happily spend without bound. The query encodes this as
    // `"dailyBudget" > 0 OR "monthlyBudget" > 0`, which is false for 0/0.
    stub({ budget: false });
    expect((await getOnboardingState("org-1")).steps.find((s) => s.id === "budget")?.done).toBe(false);
  });

  it("survives an organization the query returned nothing for", async () => {
    // A deleted workspace mid-render must degrade to "nothing set up" rather
    // than throwing and taking the dashboard down with it.
    prisma.$queryRaw.mockResolvedValue([]);

    const state = await getOnboardingState("org-gone");
    expect(state.completedCount).toBe(0);
    expect(state.complete).toBe(false);
  });

  it("asks the database once, scoped to the caller's organization", async () => {
    stub({});
    await getOnboardingState("org-42");

    // Four separate counts through PgBouncer's single connection were four
    // serial round trips; this must stay one.
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    const [, ...params] = prisma.$queryRaw.mock.calls[0];
    expect(params.length).toBeGreaterThan(0);
    expect(params.every((value: unknown) => value === "org-42")).toBe(true);
  });

  it("gives every step a destination and a label", async () => {
    stub({});
    for (const step of (await getOnboardingState("org-1")).steps) {
      expect(step.href, step.id).toMatch(/^\//);
      expect(step.cta.length, step.id).toBeGreaterThan(0);
      expect(step.description.length, step.id).toBeGreaterThan(0);
    }
  });
});
