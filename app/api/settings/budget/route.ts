import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
    select: { monthlyBudget: true },
  });

  return NextResponse.json({ budget: Number(org?.monthlyBudget ?? 0) });
}

export async function POST(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { budget?: unknown };
  const budget = Number(body.budget);
  if (!Number.isFinite(budget) || budget < 0) {
    return NextResponse.json(
      { error: "budget must be a non-negative number" },
      { status: 400 },
    );
  }

  await prisma.organization.update({
    where: { id: auth.organizationId },
    data: { monthlyBudget: budget },
  });

  return NextResponse.json({ success: true, budget });
}
