import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const organization = await prisma.organization.findFirst();

if (!organization) {
  return NextResponse.json(
    { success: false, error: "No organization found" },
    { status: 400 }
  );
}

if (!user?.user_metadata?.organizationId) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

const orgId = user.user_metadata.organizationId;

  try {
    const agents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
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
        // specifically omit apiKey and clientSecret
      }
    });
    return NextResponse.json({ success: true, agents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = user?.user_metadata?.organizationId || "cmpzfygjy0001jm04e3d1k8n1";

  try {
    const body = await req.json();
    const { name, status, dailyBudget, monthlyBudget } = body;

    if (!name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    if (!dailyBudget || dailyBudget <= 0) return NextResponse.json({ success: false, error: "Daily Budget must be > 0" }, { status: 400 });
    if (!monthlyBudget || monthlyBudget <= 0) return NextResponse.json({ success: false, error: "Monthly Budget must be > 0" }, { status: 400 });

    const rawKey = `whoai_sk_${crypto.randomBytes(32).toString("hex")}`;
    const hashedKey = await bcrypt.hash(rawKey, 12);

    const clientId = crypto.randomUUID();
    const clientSecret = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);

    const agent = await prisma.agent.create({
      data: {
        name,
        status: status || "ACTIVE",
        dailyBudget,
        monthlyBudget,
        apiKey: hashedKey,
        clientId,
        clientSecret,
        organizationId: orgId,
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

    return NextResponse.json({ success: true, agent, generatedApiKey: rawKey });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
