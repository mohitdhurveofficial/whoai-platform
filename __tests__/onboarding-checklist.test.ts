import { beforeEach, describe, expect, it, vi } from "vitest";

// Prisma is mocked before the module under test is imported so no client is
// ever constructed and no connection attempted.
const prisma = {
  providerCredential: { count: vi.fn() },
  agent: { count: vi.fn() },
  requestLog: { count: vi.fn() },
  organization: { findUnique: vi.fn() },
};
vi.mock("@/lib/prisma", () => ({ prisma }));

const { getOnboardingState } = await import("@/lib/onboarding/checklist");

type Setup = {
  providers?: number;
  agents?: number;
  requests?: number;
  dailyBudget?: number;
  monthlyBudget?: number;
};

function stub({ providers = 0, agents = 0, requests = 0, dailyBudget = 0, monthlyBudget = 0 }: Setup) {
  prisma.providerCredential.count.mockResolvedValue(providers);
  prisma.agent.count.mockResolvedValue(agents);
  prisma.requestLog.count.mockResolvedValue(requests);
  prisma.organization.findUnique.mockResolvedValue({ dailyBudget, monthlyBudget });
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
    stub({ providers: 1, agents: 2, requests: 40, monthlyBudget: 500 });
    const state = await getOnboardingState("org-1");

    expect(state.complete).toBe(true);
    expect(state.completedCount).toBe(4);
    expect(state.nextStep).toBeNull();
  });

  it("advances nextStep past whatever is already done", async () => {
    stub({ providers: 1, agents: 1 });
    const state = await getOnboardingState("org-1");

    expect(state.completedCount).toBe(2);
    expect(state.nextStep?.id).toBe("request");
  });

  it("accepts either budget window as satisfying the budget step", async () => {
    stub({ dailyBudget: 25 });
    expect((await getOnboardingState("org-1")).steps.find((s) => s.id === "budget")?.done).toBe(true);

    stub({ monthlyBudget: 25 });
    expect((await getOnboardingState("org-1")).steps.find((s) => s.id === "budget")?.done).toBe(true);
  });

  it("treats a zero budget as unset, not as a zero allowance", async () => {
    // The kill switch reads 0 as "no limit configured", so the checklist must
    // agree — otherwise we would tell a customer they are protected when the
    // gateway would happily spend without bound.
    stub({ dailyBudget: 0, monthlyBudget: 0 });
    expect((await getOnboardingState("org-1")).steps.find((s) => s.id === "budget")?.done).toBe(false);
  });

  it("handles Prisma Decimal budgets, not just numbers", async () => {
    // Prisma returns Decimal for @db.Decimal columns; a naive `> 0` on the
    // object would be false for every real budget.
    prisma.providerCredential.count.mockResolvedValue(0);
    prisma.agent.count.mockResolvedValue(0);
    prisma.requestLog.count.mockResolvedValue(0);
    prisma.organization.findUnique.mockResolvedValue({
      dailyBudget: { toString: () => "50.0000" },
      monthlyBudget: { toString: () => "0" },
    });

    const state = await getOnboardingState("org-1");
    expect(state.steps.find((s) => s.id === "budget")?.done).toBe(true);
  });

  it("treats a missing organization as having no budget", async () => {
    stub({ providers: 1 });
    prisma.organization.findUnique.mockResolvedValue(null);

    const state = await getOnboardingState("org-1");
    expect(state.steps.find((s) => s.id === "budget")?.done).toBe(false);
  });

  it("scopes every query to the caller's organization", async () => {
    stub({});
    await getOnboardingState("org-42");

    for (const call of [
      prisma.providerCredential.count,
      prisma.agent.count,
      prisma.requestLog.count,
    ]) {
      expect(call).toHaveBeenCalledWith({ where: { organizationId: "org-42" } });
    }
    expect(prisma.organization.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "org-42" } }),
    );
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
