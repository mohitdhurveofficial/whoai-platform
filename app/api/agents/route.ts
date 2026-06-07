import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { getServerAuthContext } from "@/lib/server/auth";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.organizationId;

  try {
    const agents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
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
    return NextResponse.json({ success: true, agents });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const orgId = auth.organizationId;

  try {
    const body = await req.json();
    const { name, status, dailyBudget, monthlyBudget } = body;

    if (!name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    if (!dailyBudget || dailyBudget <= 0) return NextResponse.json({ success: false, error: "Daily Budget must be > 0" }, { status: 400 });
    if (!monthlyBudget || monthlyBudget <= 0) return NextResponse.json({ success: false, error: "Monthly Budget must be > 0" }, { status: 400 });

    // Agent API keys are high-entropy secrets, so we store a deterministic
    // SHA-256 hash (lookup-able by the gateway token endpoint), mirroring
    // lib/security/api-keys.ts. The raw key is returned to the caller once.
    const rawKey = `whoai_sk_${crypto.randomBytes(32).toString("hex")}`;
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

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
        dailyBudget: true,
        monthlyBudget: true,
        currentDailySpend: true,
        organizationId: true,
        createdAt: true,
        scopes: true,
        clientId: true,
      }
    });

    // Audit Log for Agent Creation
    await prisma.activityLog.create({
      data: {
        organizationId: orgId,
        agentId: agent.id,
        action: "AGENT_CREATED",
        metadata: { name: agent.name, dailyBudget, monthlyBudget },
      }
    });

    return NextResponse.json({ success: true, agent, generatedApiKey: rawKey });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}
