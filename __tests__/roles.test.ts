import { describe, expect, it } from "vitest";
import { can, hasRole, isRole, normalizeRole, outranks, PERMISSIONS, ROLES } from "@/lib/auth/roles";

describe("normalizeRole", () => {
  it("accepts known roles case-insensitively", () => {
    expect(normalizeRole("owner")).toBe("OWNER");
    expect(normalizeRole("  Admin ")).toBe("ADMIN");
  });

  it("falls back to the LEAST privileged role for anything unrecognized", () => {
    // The safe reading of an unknown value is "grant nothing", not "grant the
    // default" — a corrupted or tampered column must not confer DEVELOPER.
    expect(normalizeRole("SUPERUSER")).toBe("VIEWER");
    expect(normalizeRole(null)).toBe("VIEWER");
    expect(normalizeRole(undefined)).toBe("VIEWER");
    expect(normalizeRole("")).toBe("VIEWER");
  });
});

describe("hasRole", () => {
  it("is satisfied by an equal or higher rank", () => {
    expect(hasRole("OWNER", "ADMIN")).toBe(true);
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
    expect(hasRole("DEVELOPER", "ADMIN")).toBe(false);
    expect(hasRole("VIEWER", "DEVELOPER")).toBe(false);
  });

  it("lets every role satisfy VIEWER", () => {
    for (const role of ROLES) expect(hasRole(role, "VIEWER")).toBe(true);
  });
});

describe("outranks", () => {
  it("requires strictly greater rank", () => {
    expect(outranks("OWNER", "ADMIN")).toBe(true);
    // Equal rank is not enough: an OWNER must not be able to demote another
    // OWNER out from under them.
    expect(outranks("OWNER", "OWNER")).toBe(false);
    expect(outranks("ADMIN", "OWNER")).toBe(false);
  });
});

describe("can", () => {
  it("keeps VIEWER read-only", () => {
    expect(can("VIEWER", "viewDashboard")).toBe(true);
    expect(can("VIEWER", "viewBilling")).toBe(true);
    expect(can("VIEWER", "manageAgents")).toBe(false);
    expect(can("VIEWER", "manageApiKeys")).toBe(false);
  });

  it("stops a DEVELOPER touching workspace configuration or money", () => {
    expect(can("DEVELOPER", "manageAgents")).toBe(true);
    expect(can("DEVELOPER", "manageProviderKeys")).toBe(false);
    expect(can("DEVELOPER", "manageBudgets")).toBe(false);
    expect(can("DEVELOPER", "manageBilling")).toBe(false);
  });

  it("stops an ADMIN touching billing, roles, or deletion", () => {
    expect(can("ADMIN", "manageProviderKeys")).toBe(true);
    expect(can("ADMIN", "manageInvites")).toBe(true);
    expect(can("ADMIN", "manageBilling")).toBe(false);
    expect(can("ADMIN", "manageMemberRoles")).toBe(false);
    expect(can("ADMIN", "deleteWorkspace")).toBe(false);
  });

  it("grants an OWNER everything", () => {
    for (const permission of Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]) {
      expect(can("OWNER", permission)).toBe(true);
    }
  });

  it("grants an unrecognized role nothing beyond read", () => {
    expect(can("GOD_MODE", "manageBilling")).toBe(false);
    expect(can("GOD_MODE", "manageAgents")).toBe(false);
    expect(can("GOD_MODE", "viewDashboard")).toBe(true);
  });
});

describe("isRole", () => {
  it("recognizes exactly the four roles", () => {
    for (const role of ROLES) expect(isRole(role)).toBe(true);
    expect(isRole("SUPERADMIN")).toBe(false);
    expect(isRole(42)).toBe(false);
    expect(isRole(null)).toBe(false);
  });
});
