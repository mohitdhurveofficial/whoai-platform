import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

function budgetStatus(currentSpend: number, budgetLimit: number) {
  const utilizationPercent = budgetLimit > 0 ? (currentSpend / budgetLimit) * 100 : 0;
  const remainingBudget = budgetLimit > 0 ? Math.max(budgetLimit - currentSpend, 0) : 0;

  let status: "OK" | "WARNING" | "CRITICAL" | "BLOCKED" | "UNLIMITED" = "OK";
  if (budgetLimit <= 0) status = "UNLIMITED";
  else if (utilizationPercent >= 100) status = "BLOCKED";
  else if (utilizationPercent >= 90) status = "CRITICAL";
  else if (utilizationPercent >= 75) status = "WARNING";

  return {
    currentSpend,
    budgetLimit,
    remainingBudget,
    utilizationPercent,
    warningPercent: 75,
    criticalPercent: 90,
    status,
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = user?.user_metadata?.organizationId;

  if (!orgId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        agents: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            
          },
        },
        alerts: {
          where: { resolved: false },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            type: true,
            severity: true,
            title: true,
            message: true,
            metadata: true,
            createdAt: true,
            agent: { select: { name: true } },
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    const blockedRequestsCount = await prisma.activityLog.count({
      where: {
        organizationId: orgId,
        action: "REQUEST_BLOCKED",
      },
    });

    const agents = organization.agents.map((agent) => ({
  id: agent.id,
  name: agent.name,
}));

    return NextResponse.json({
      success: true,
      budget: {
        organization: {
          id: organization.id,
          name: organization.name,
   },
        agents,
        activeAlertCount: organization.alerts.length,
        blockedRequestsCount,
        recentAlerts: organization.alerts.map((alert) => ({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          metadata: alert.metadata,
          agentName: alert.agent?.name || "Organization",
          createdAt: alert.createdAt?.toISOString() ?? null,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
