import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

export async function GET(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.organizationId;

  try {
    const params = await context.params;
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        status: true,
        dailyBudget: true,
        monthlyBudget: true,
        currentDailySpend: true,
        organizationId: true,
        createdAt: true,
        scopes: true,
        clientId: true,
      }
    });

    if (!agent || agent.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agent });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.organizationId;

  try {
    const params = await context.params;
    const body = await req.json();
    const { name, status, dailyBudget, monthlyBudget } = body;

    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id },
    });

    if (!existingAgent || existingAgent.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
    }

    if (!name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    if (!dailyBudget || dailyBudget <= 0) return NextResponse.json({ success: false, error: "Daily Budget must be > 0" }, { status: 400 });
    if (!monthlyBudget || monthlyBudget <= 0) return NextResponse.json({ success: false, error: "Monthly Budget must be > 0" }, { status: 400 });

    const agent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        name,
        status,
        dailyBudget,
        monthlyBudget,
      },
      select: {
        id: true,
        name: true,
        status: true,
        dailyBudget: true,
        monthlyBudget: true,
        currentDailySpend: true,
        organizationId: true,
        createdAt: true,
        scopes: true,
        clientId: true,
      }
    });

    return NextResponse.json({ success: true, agent });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.organizationId;

  try {
    const params = await context.params;
    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id },
    });

    if (!existingAgent || existingAgent.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.policy.deleteMany({ where: { agentId: params.id, organizationId: orgId } }),
      prisma.alert.deleteMany({ where: { agentId: params.id, organizationId: orgId } }),
      prisma.activityLog.deleteMany({ where: { agentId: params.id, organizationId: orgId } }),
      prisma.requestLog.deleteMany({ where: { agentId: params.id, organizationId: orgId } }),
      prisma.usageMetrics.deleteMany({ where: { agentId: params.id, organizationId: orgId } }),
      prisma.spendLog.deleteMany({ where: { agentId: params.id, organizationId: orgId } }),
      prisma.agent.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true, message: "Agent deleted" });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}
