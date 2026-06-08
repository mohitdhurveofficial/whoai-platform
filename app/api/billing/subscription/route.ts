import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { normalizeTier, planConfig } from "@/lib/subscription";

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
        stripeCustomerId: true,
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

    return NextResponse.json({
      tier,
      label: config.label,
      status: organization.subscriptionStatus,
      currentPeriodEnd: organization.currentPeriodEnd,
      hasBillingAccount: Boolean(organization.stripeCustomerId),
      usage: {
        agents: agentCount,
        maxAgents, // null = unlimited
      },
    });
  } catch (error) {
    console.error("Subscription fetch error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not load subscription" }, { status: 500 });
  }
}
