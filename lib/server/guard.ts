import { NextResponse } from "next/server";
import { can, type Permission, PERMISSIONS, ROLE_DESCRIPTIONS } from "@/lib/auth/roles";
import { getServerAuthContext, type ServerAuthContext } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";
import {
  hasFeature,
  lowestPlanWithFeature,
  normalizeTier,
  planConfig,
  type FeatureKey,
} from "@/lib/subscription";

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

/**
 * Plan entitlement guard: authenticate, then check the organization's tier
 * actually includes `feature`.
 *
 * This is the authoritative check. The dashboard hides controls a plan does not
 * include, but hiding a button stops nobody from POSTing to the route — without
 * this, every paid capability is free to anyone who opens the network tab.
 *
 * The tier is read from the database per call rather than trusted from the
 * session, for the same reason `role` is: a downgrade must take effect when
 * Stripe says so, not whenever the customer's token happens to expire.
 *
 * 402 rather than 403: the caller is who they claim to be and has the rank, the
 * plan simply does not cover this. That distinction is what lets the UI show an
 * upgrade prompt instead of "ask an admin".
 */
export async function requireFeature(
  feature: FeatureKey,
  permission?: Permission,
): Promise<GuardResult> {
  const guard = permission ? await requirePermission(permission) : await requireAuth();
  if (!guard.ok) return guard;

  const org = await prisma.organization.findUnique({
    where: { id: guard.auth.organizationId },
    select: { subscriptionTier: true },
  });

  if (!hasFeature(org?.subscriptionTier, feature)) {
    const required = lowestPlanWithFeature(feature);
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: required
            ? `Your plan does not include this feature. Available on ${planConfig(required).label} and above.`
            : "This feature is not available yet.",
          feature,
          // null when nothing ships it yet, so the UI can say "coming soon"
          // rather than offering an upgrade that would not deliver it.
          requiredPlan: required,
          currentPlan: normalizeTier(org?.subscriptionTier),
          upgradeRequired: required !== null,
        },
        { status: 402 },
      ),
    };
  }

  return guard;
}
