import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.organizationId;

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
  } catch (error) {
    return NextResponse.json(
  {
    success: false,
    error: error instanceof Error ? error.message : "Internal error",
  },
  { status: 500 },
  );
  }
}
