import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

export async function POST(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.organizationId;

  const params = await context.params;
  const body = await req.json().catch(() => ({}));
  const reason = body.reason || "MANUAL_RESUME";

  try {
    const agent = await prisma.agent.findUnique({ where: { id: params.id } });
    if (!agent || agent.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
    }
    if (agent.status === "TERMINATED") {
      return NextResponse.json({ success: false, error: "Terminated agents cannot be resumed" }, { status: 409 });
    }

    const metadata = { reason, actorId: auth.userId };
    const updatedAgent = await prisma.$transaction(async (tx) => {
      const resumed = await tx.agent.update({
        where: { id: params.id },
        data: {
          status: "ACTIVE",
          pauseReason: null,
          pausedAt: null,
          pausedBy: null,
        },
      });

      await tx.alert.create({
        data: {
          organizationId: orgId,
          agentId: params.id,
          type: "AGENT_RESUMED",
          severity: "HIGH",
          title: "Agent resumed",
          message: "Agent resumed.",
          metadata,
        },
      });
      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          agentId: params.id,
          action: "AGENT_RESUMED",
          status: "SUCCESS",
          metadata,
        },
      });

      return resumed;
    });

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}
