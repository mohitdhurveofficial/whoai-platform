/**
 * Role and permission model for the control plane.
 *
 * Before this, `User.role` was written at signup ("OWNER") and read only for
 * display and the alert-dispatch cron — no API route consulted it. Once teams
 * exist that is a hole: an invited DEVELOPER could rotate the organization's
 * provider keys or cancel its subscription.
 *
 * The model is a strict hierarchy, not a permission matrix. Four roles is few
 * enough that ranking them is unambiguous, and a rank comparison cannot drift
 * out of sync the way parallel permission lists do.
 *
 *   VIEWER    — read everything, change nothing. For finance and leadership.
 *   DEVELOPER — plus operate agents: create, pause, resume, rotate API keys.
 *   ADMIN     — plus manage the workspace: budgets, provider keys, invites.
 *   OWNER     — plus billing and destructive actions: subscriptions, role
 *               changes, deleting the workspace.
 */

export const ROLES = ["VIEWER", "DEVELOPER", "ADMIN", "OWNER"] as const;

export type Role = (typeof ROLES)[number];

/** Higher rank implies every capability of the ranks below it. */
const RANK: Record<Role, number> = {
  VIEWER: 0,
  DEVELOPER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export const DEFAULT_ROLE: Role = "DEVELOPER";

/**
 * Coerce a stored role string to a known role.
 *
 * Falls back to the *least* privileged role rather than the default one: an
 * unrecognized value in the column is a bug or tampering, and the safe reading
 * of "I don't know what this is" is "grant nothing".
 */
export function normalizeRole(value: string | null | undefined): Role {
  const upper = (value ?? "").trim().toUpperCase();
  return (ROLES as readonly string[]).includes(upper) ? (upper as Role) : "VIEWER";
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value.toUpperCase());
}

/** True when `role` is at least as privileged as `minimum`. */
export function hasRole(role: string | null | undefined, minimum: Role): boolean {
  return RANK[normalizeRole(role)] >= RANK[minimum];
}

/** True when `actor` outranks `target` — required to change someone's role. */
export function outranks(actor: string | null | undefined, target: string | null | undefined): boolean {
  return RANK[normalizeRole(actor)] > RANK[normalizeRole(target)];
}

/**
 * The minimum role each guarded capability requires. Named capabilities rather
 * than raw route paths so a route can move without silently losing its guard.
 */
export const PERMISSIONS = {
  // Read-only surfaces — every member, including VIEWER.
  viewDashboard: "VIEWER",
  viewUsage: "VIEWER",
  viewBilling: "VIEWER",
  viewTeam: "VIEWER",

  // Day-to-day agent operation.
  manageAgents: "DEVELOPER",
  manageApiKeys: "DEVELOPER",
  acknowledgeAlerts: "DEVELOPER",

  // Workspace configuration.
  manageBudgets: "ADMIN",
  manageProviderKeys: "ADMIN",
  manageOrganization: "ADMIN",
  manageInvites: "ADMIN",

  // Irreversible or money-moving.
  manageBilling: "OWNER",
  manageMemberRoles: "OWNER",
  deleteWorkspace: "OWNER",
} as const satisfies Record<string, Role>;

export type Permission = keyof typeof PERMISSIONS;

/** True when `role` satisfies the minimum rank for `permission`. */
export function can(role: string | null | undefined, permission: Permission): boolean {
  return hasRole(role, PERMISSIONS[permission]);
}

/** Human-facing label and blurb, used by the team settings UI. */
export const ROLE_DESCRIPTIONS: Record<Role, { label: string; description: string }> = {
  OWNER: { label: "Owner", description: "Full access, including billing and workspace deletion." },
  ADMIN: { label: "Admin", description: "Manage budgets, provider keys, and team members." },
  DEVELOPER: { label: "Developer", description: "Create and operate agents and API keys." },
  VIEWER: { label: "Viewer", description: "Read-only access to dashboards and usage." },
};
