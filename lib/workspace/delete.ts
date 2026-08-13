import { prisma } from "@/lib/prisma";
import { reportError } from "@/lib/observability/report";

/**
 * Permanent deletion of a workspace and everything attached to it.
 *
 * Two things make this more than a `prisma.organization.delete()`:
 *
 * 1. Most relations in schema.prisma have no `onDelete: Cascade`, so the
 *    parent delete would fail on a foreign key. Deleting children explicitly,
 *    in dependency order, is also the safer default — when a model is added
 *    later and left out of this list, the delete fails loudly with an FK error
 *    instead of quietly orphaning its rows.
 *
 * 2. Provider credentials and the Stripe subscription outlive the row. The
 *    subscription has to be cancelled or the customer keeps being billed for a
 *    workspace that no longer exists.
 */

/** Deletion order: every table that references the org, children first. */
async function deleteOrganizationRows(organizationId: string) {
  const where = { organizationId };

  // Inside one transaction: a half-deleted workspace — agents gone, spend
  // history stranded — is worse than a failed delete the owner can retry.
  await prisma.$transaction([
    // Telemetry and audit rows. These reference both the org and an agent, so
    // they must go before agents do.
    prisma.requestLog.deleteMany({ where }),
    prisma.spendLog.deleteMany({ where }),
    prisma.usageMetrics.deleteMany({ where }),
    prisma.activityLog.deleteMany({ where }),
    prisma.budgetViolation.deleteMany({ where }),
    prisma.alert.deleteMany({ where }),
    prisma.ledgerEntry.deleteMany({ where }),
    prisma.policy.deleteMany({ where }),

    prisma.agent.deleteMany({ where }),

    // Credentials and access. The encrypted provider keys are destroyed with
    // the row; nothing here is recoverable afterwards.
    prisma.providerCredential.deleteMany({ where }),
    prisma.apiKey.deleteMany({ where }),

    // Invites reference users (SetNull), so they go first regardless.
    prisma.invite.deleteMany({ where }),
    prisma.user.deleteMany({ where }),

    prisma.subscription.deleteMany({ where }),

    prisma.organization.delete({ where: { id: organizationId } }),
  ]);
}

/**
 * Cancel the Stripe subscription before the org row disappears.
 *
 * Best-effort by design: a Stripe outage must not block someone from deleting
 * their data. A failure is reported so it can be cancelled by hand — the
 * alternative, aborting the delete, leaves the customer unable to leave.
 */
async function cancelSubscription(
  organizationId: string,
  stripeSubscriptionId: string | null,
): Promise<{ cancelled: boolean }> {
  if (!stripeSubscriptionId) return { cancelled: false };

  try {
    // getStripe() throws when STRIPE_SECRET_KEY is unset, which the catch below
    // treats like any other Stripe failure: reported, not fatal.
    const { getStripe } = await import("@/lib/stripe");
    await getStripe().subscriptions.cancel(stripeSubscriptionId);
    return { cancelled: true };
  } catch (error) {
    await reportError(error, {
      source: "workspace-delete:stripe-cancel",
      extra: { organizationId, stripeSubscriptionId },
    });
    return { cancelled: false };
  }
}

/**
 * Remove the Supabase auth identities for the workspace's members.
 *
 * Without this the login still fails — the route 403s when no User row backs
 * the identity — but Supabase keeps the email reserved, so the person cannot
 * sign up again with the address they just deleted. Requires
 * SUPABASE_SERVICE_ROLE_KEY; when it is unset we say so rather than pretend.
 */
async function deleteAuthIdentities(
  userIds: string[],
): Promise<{ deleted: number; skipped: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || userIds.length === 0) {
    return { deleted: 0, skipped: true };
  }

  let deleted = 0;
  for (const id of userIds) {
    try {
      const response = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        signal: AbortSignal.timeout(10_000),
      });
      // 404 means the identity is already gone, which is the desired end state.
      if (response.ok || response.status === 404) deleted += 1;
    } catch (error) {
      await reportError(error, {
        source: "workspace-delete:auth-identity",
        extra: { userId: id },
      });
    }
  }

  return { deleted, skipped: false };
}

export type DeleteWorkspaceResult = {
  subscriptionCancelled: boolean;
  authIdentitiesDeleted: number;
  authIdentitiesSkipped: boolean;
};

/**
 * Delete `organizationId` and everything belonging to it. Irreversible.
 *
 * Order matters: Stripe is cancelled first (while we still have the customer
 * ID), then the database rows go, then the auth identities — so a failure
 * partway through never leaves a live subscription attached to data that is
 * already gone.
 */
export async function deleteWorkspace(organizationId: string): Promise<DeleteWorkspaceResult> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      stripeSubscriptionId: true,
      users: { select: { id: true } },
    },
  });

  if (!organization) throw new Error("Workspace not found");

  const { cancelled } = await cancelSubscription(
    organizationId,
    organization.stripeSubscriptionId,
  );

  await deleteOrganizationRows(organizationId);

  // After the rows, not before: if the transaction rolls back, the members can
  // still sign in.
  const auth = await deleteAuthIdentities(organization.users.map((user) => user.id));

  return {
    subscriptionCancelled: cancelled,
    authIdentitiesDeleted: auth.deleted,
    authIdentitiesSkipped: auth.skipped,
  };
}
