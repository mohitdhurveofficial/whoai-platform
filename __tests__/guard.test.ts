import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocked before importing the guard so the real module (which pulls in Prisma
// and the Supabase server client) is never loaded.
const getServerAuthContext = vi.fn();
vi.mock("@/lib/server/auth", () => ({ getServerAuthContext }));

const { requireAuth, requirePermission } = await import("@/lib/server/guard");

describe("requirePermission", () => {
  // Braces, not a concise body: mockReset() returns the mock, and vitest treats
  // a function returned from beforeEach as a teardown callback — it would call
  // the mock after every test.
  beforeEach(() => {
    getServerAuthContext.mockReset();
  });

  it("401s when there is no session", async () => {
    getServerAuthContext.mockResolvedValue(null);

    const result = await requirePermission("manageAgents");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
  });

  it("401s rather than throwing when resolving the session blows up", async () => {
    getServerAuthContext.mockRejectedValue(new Error("db down"));

    const result = await requirePermission("manageAgents");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
  });

  it("403s with actionable detail when the role is too low", async () => {
    getServerAuthContext.mockResolvedValue({ userId: "u1", organizationId: "o1", role: "DEVELOPER" });

    const result = await requirePermission("manageBilling");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);

    const body = await result.response.json();
    // The UI needs to say "ask an Owner", not just show a bare 403.
    expect(body).toMatchObject({ requiredRole: "OWNER", requiredRoleLabel: "Owner", yourRole: "DEVELOPER" });
  });

  it("passes the auth context through when the role suffices", async () => {
    const auth = { userId: "u1", organizationId: "o1", role: "ADMIN" };
    getServerAuthContext.mockResolvedValue(auth);

    const result = await requirePermission("manageProviderKeys");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.auth).toEqual(auth);
  });

  it("blocks a VIEWER from every write capability", async () => {
    getServerAuthContext.mockResolvedValue({ userId: "u1", organizationId: "o1", role: "VIEWER" });

    for (const permission of ["manageAgents", "manageApiKeys", "manageBudgets", "manageBilling"] as const) {
      const result = await requirePermission(permission);
      expect(result.ok, permission).toBe(false);
    }
  });

  it("lets a VIEWER read", async () => {
    getServerAuthContext.mockResolvedValue({ userId: "u1", organizationId: "o1", role: "VIEWER" });

    const result = await requirePermission("viewUsage");
    expect(result.ok).toBe(true);
  });
});

describe("requireAuth", () => {
  beforeEach(() => {
    getServerAuthContext.mockReset();
  });

  it("admits any authenticated role, including VIEWER", async () => {
    getServerAuthContext.mockResolvedValue({ userId: "u1", organizationId: "o1", role: "VIEWER" });
    expect((await requireAuth()).ok).toBe(true);
  });

  it("401s when signed out", async () => {
    getServerAuthContext.mockResolvedValue(null);
    const result = await requireAuth();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
  });
});
