import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.user_metadata?.organizationId) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

const orgId = user.user_metadata.organizationId;

  try {
    const params = await context.params;
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        status: true,
        pauseReason: true,
        pausedAt: true,
        pausedBy: true,
        dailyBudget: true,
        monthlyBudget: true,
        currentDailySpend: true,
        currentMonthlySpend: true,
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = user?.user_metadata?.organizationId || "cmpzfygjy0001jm04e3d1k8n1";

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
        pauseReason: true,
        pausedAt: true,
        pausedBy: true,
        dailyBudget: true,
        monthlyBudget: true,
        currentDailySpend: true,
        currentMonthlySpend: true,
        organizationId: true,
        createdAt: true,
        scopes: true,
        clientId: true,
      }
    });

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = user?.user_metadata?.organizationId || "cmpzfygjy0001jm04e3d1k8n1";

  try {
    const params = await context.params;
    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id },
    });

    if (!existingAgent || existingAgent.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.policy.deleteMany({ where: { agentId: params.id } }),
      prisma.spendLog.deleteMany({ where: { agentId: params.id } }),
      prisma.agent.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true, message: "Agent deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
