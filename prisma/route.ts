import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalWorkers, activeWorkers, totalConvs, totalMessages] = await Promise.all([
    prisma.agent.count({ where: { organizationId: session.organizationId } }),
    prisma.agent.count({ where: { organizationId: session.organizationId, status: "ACTIVE" } }),
    prisma.conversation.count({ where: { organizationId: session.organizationId } }),
    prisma.message.count({ where: { conversation: { organizationId: session.organizationId } } }),
  ]);

  return NextResponse.json({
    totalWorkers,
    activeWorkers,
    totalConversations: totalConvs,
    totalMessages,
  });
}