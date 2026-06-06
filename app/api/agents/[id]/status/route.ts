import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

export async function POST(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.organizationId;

  try {
    const params = await context.params;
    const body = await req.json();
    const { status, reason } = body;

    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id },
    });

    if (!existingAgent || existingAgent.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
    }

    if (!["ACTIVE", "PAUSED", "QUARANTINED", "TERMINATED"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const agent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        status,
        pauseReason: status === "ACTIVE" ? null : (reason || `Manual status update to ${status}`),
        pausedAt: status === "ACTIVE" ? null : new Date(),
        pausedBy: status === "ACTIVE" ? null : auth.userId,
      },
    });

    // Alert
    await prisma.alert.create({
      data: {
        organizationId: orgId,
        agentId: agent.id,
        type: status === "ACTIVE" ? "AGENT_RESUMED" : (status === "TERMINATED" ? "AGENT_TERMINATED" : "AGENT_PAUSED"),
        severity: status === "TERMINATED" ? "CRITICAL" : (status === "ACTIVE" ? "INFO" : "HIGH"),
        title: `Agent ${status.toLowerCase()}`,
        message: `Agent ${status.toLowerCase()} manually via dashboard.`,
        metadata: { reason },
      }
    });

    // Activity Log
    await prisma.activityLog.create({
      data: {
        organizationId: orgId,
        agentId: agent.id,
        action: status === "ACTIVE" ? "AGENT_RESUMED" : (status === "TERMINATED" ? "AGENT_TERMINATED" : "AGENT_PAUSED"),
        status: "SUCCESS",
        metadata: { reason, actorId: auth.userId },
      }
    });

    return NextResponse.json({ success: true, agent });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
