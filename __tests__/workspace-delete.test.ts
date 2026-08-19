import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The value of these tests is coverage of the *table list*. Most relations in
 * schema.prisma have no `onDelete: Cascade`, so this module deletes each child
 * table by hand — and a table left out means a deleted customer's telemetry or
 * encrypted provider keys quietly survive.
 */

// Every model with an organizationId, so a forgotten delete shows up as a
// missing call rather than as a passing test.
const MODELS = [
  "requestLog",
  "spendLog",
  "usageMetrics",
  "activityLog",
  "budgetViolation",
  "alert",
  "ledgerEntry",
  "policy",
  "agent",
  "providerCredential",
  "apiKey",
  "invite",
  "user",
  "subscription",
] as const;

type Call = { model: string; op: string; args: unknown };

const calls: Call[] = [];

function model(name: string) {
  return {
    deleteMany: vi.fn((args: unknown) => {
      calls.push({ model: name, op: "deleteMany", args });
      return { model: name, op: "deleteMany", args };
    }),
    delete: vi.fn((args: unknown) => {
      calls.push({ model: name, op: "delete", args });
      return { model: name, op: "delete", args };
    }),
  };
}

const prisma = {
  ...Object.fromEntries(MODELS.map((name) => [name, model(name)])),
  organization: {
    ...model("organization"),
    findUnique: vi.fn(),
  },
  // Prisma's array form takes already-built promises; recording happens when
  // each is constructed, so the transaction only has to resolve them.
  $transaction: vi.fn(async (operations: unknown[]) => operations),
} as unknown as Record<string, { deleteMany: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> }> & {
  organization: { findUnique: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const reportError = vi.fn();
const cancel = vi.fn();

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/observability/report", () => ({ reportError }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ subscriptions: { cancel } }),
}));

const { deleteWorkspace } = await import("@/lib/workspace/delete");

function stubOrganization(overrides: Record<string, unknown> = {}) {
  prisma.organization.findUnique.mockResolvedValue({
    stripeSubscriptionId: null,
    users: [],
    ...overrides,
  });
}

beforeEach(() => {
  calls.length = 0;
  vi.clearAllMocks();
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe("deleteWorkspace", () => {
  it("deletes every table that references the organization", async () => {
    stubOrganization();

    await deleteWorkspace("org-1");

    const deleted = new Set(calls.map((call) => call.model));
    for (const name of MODELS) {
      expect(deleted, `${name} rows would survive the workspace`).toContain(name);
    }
    expect(deleted).toContain("organization");
  });

  it("scopes every delete to the one organization", async () => {
    stubOrganization();

    await deleteWorkspace("org-1");

    for (const call of calls) {
      if (call.model === "organization" && call.op === "delete") {
        expect(call.args).toEqual({ where: { id: "org-1" } });
      } else {
        expect(call.args, `${call.model} was not scoped to the org`).toEqual({
          where: { organizationId: "org-1" },
        });
      }
    }
  });

  it("deletes telemetry before the agents it points at", async () => {
    stubOrganization();

    await deleteWorkspace("org-1");

    const order = calls.map((call) => call.model);
    // Foreign keys, not aesthetics: requestLog.agentId would block the agent
    // delete if these ran the other way around.
    for (const child of ["requestLog", "spendLog", "usageMetrics", "activityLog"]) {
      expect(order.indexOf(child)).toBeLessThan(order.indexOf("agent"));
    }
    // The organization row goes last, once nothing references it.
    expect(order.at(-1)).toBe("organization");
  });

  it("runs the deletes in a single transaction", async () => {
    stubOrganization();

    await deleteWorkspace("org-1");

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("cancels the Stripe subscription before the rows go", async () => {
    stubOrganization({ stripeSubscriptionId: "sub_123" });

    const result = await deleteWorkspace("org-1");

    expect(cancel).toHaveBeenCalledWith("sub_123");
    expect(result.subscriptionCancelled).toBe(true);
    // Cancelled first, while the customer ID is still readable.
    expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.$transaction.mock.invocationCallOrder[0],
    );
  });

  it("still deletes the data when Stripe is down", async () => {
    stubOrganization({ stripeSubscriptionId: "sub_123" });
    cancel.mockRejectedValue(new Error("stripe unreachable"));

    const result = await deleteWorkspace("org-1");

    // Refusing to delete would trap the customer in a workspace they asked to
    // leave; the failed cancellation is reported and reported back instead.
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.subscriptionCancelled).toBe(false);
    expect(reportError).toHaveBeenCalled();
  });

  it("reports auth identities as skipped when no service-role key is set", async () => {
    stubOrganization({ users: [{ id: "user-1" }] });

    const result = await deleteWorkspace("org-1");

    // Without the key the Supabase identity survives and its email stays
    // reserved, so the caller has to be told rather than assume it is gone.
    expect(result.authIdentitiesSkipped).toBe(true);
    expect(result.authIdentitiesDeleted).toBe(0);
  });

  it("refuses to touch anything when the workspace does not exist", async () => {
    prisma.organization.findUnique.mockResolvedValue(null);

    await expect(deleteWorkspace("missing")).rejects.toThrow("Workspace not found");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
