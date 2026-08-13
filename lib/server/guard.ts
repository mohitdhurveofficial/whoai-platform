import { NextResponse } from "next/server";
import { can, type Permission, PERMISSIONS, ROLE_DESCRIPTIONS } from "@/lib/auth/roles";
import { getServerAuthContext, type ServerAuthContext } from "@/lib/server/auth";

/**
 * Authorization guard for route handlers.
 *
 * Usage is deliberately a single line at the top of a handler:
 *
 *   const guard = await requirePermission("manageProviderKeys");
 *   if (!guard.ok) return guard.response;
 *   // guard.auth is a fully-typed, authorized ServerAuthContext
 *
 * Returning a discriminated union rather than throwing means TypeScript forces
 * the caller to handle the deny branch — a guard you forget to check is a
 * compile error at the point of use, not a silent hole in production.
 */

export type GuardResult =
  | { ok: true; auth: ServerAuthContext }
  | { ok: false; response: NextResponse };

/** 401 when signed out, 403 when signed in without the rank. */
export async function requirePermission(permission: Permission): Promise<GuardResult> {
  const auth = await getServerAuthContext().catch(() => null);

  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  if (!can(auth.role, permission)) {
    const required = PERMISSIONS[permission];
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Insufficient permissions",
          // Told plainly so the UI can render "Ask an Admin to do this" rather
          // than a bare 403 the user cannot act on.
          requiredRole: required,
          requiredRoleLabel: ROLE_DESCRIPTIONS[required].label,
          yourRole: auth.role,
        },
        { status: 403 },
      ),
    };
  }

  return { ok: true, auth };
}

/** Authentication only, no rank requirement — for read endpoints open to VIEWER. */
export async function requireAuth(): Promise<GuardResult> {
  const auth = await getServerAuthContext().catch(() => null);
  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }
  return { ok: true, auth };
}
