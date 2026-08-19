import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { can, PERMISSIONS, ROLE_DESCRIPTIONS } from "@/lib/auth/roles";
import { monthlyRequestQuota, normalizeTier, planConfig, retentionDays } from "@/lib/subscription";

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        currentMonthlyRequests: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const agentCount = await prisma.agent.count({
      where: { organizationId: auth.organizationId },
    });

    const tier = normalizeTier(organization.subscriptionTier);
    const config = planConfig(tier);
    const maxAgents = Number.isFinite(config.maxAgents) ? config.maxAgents : null;

    // Billing changes are OWNER-only. Sent to the client so the page can explain
    // who to ask instead of rendering buttons that answer every click with a 403.
    // This is a UI hint, never the gate: the gate is requirePermission() on the
    // checkout, portal and cancel routes.
    const billingPermission = PERMISSIONS.manageBilling;

    return NextResponse.json({
      tier,
      label: config.label,
      status: organization.subscriptionStatus,
      currentPeriodEnd: organization.currentPeriodEnd,
      cancelAtPeriodEnd: organization.cancelAtPeriodEnd,
      hasBillingAccount: Boolean(organization.stripeCustomerId),
      hasActiveSubscription: Boolean(organization.stripeSubscriptionId),
      canManageBilling: can(auth.role, "manageBilling"),
      billingRoleLabel: ROLE_DESCRIPTIONS[billingPermission].label,
      usage: {
        agents: agentCount,
        maxAgents, // null = unlimited
        // Counter the gateway actually reserves against, so what's shown here
        // is exactly what a request will be blocked on.
        requests: organization.currentMonthlyRequests,
        monthlyRequests: monthlyRequestQuota(tier), // null = unlimited
        retentionDays: retentionDays(tier),
      },
    });
  } catch (error) {
    console.error("Subscription fetch error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not load subscription" }, { status: 500 });
  }
}
