import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { GovernanceService } from "@/prisma/enforcement-service";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId, message, conversationId } = await req.json();

  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, organizationId: session.organizationId },
  });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  // CRITICAL: Evaluate Governance Policies before processing
  const policy = await GovernanceService.evaluate(agentId, session.organizationId, {
    type: "CHAT_COMPLETION",
  });
  
  if (!policy.allowed) {
    if (policy.requiresApproval) {
      await prisma.approvalRequest.create({
        data: {
          organizationId: session.organizationId,
          agentId: agent.id,
          conversationId: conversationId || "new",
          actionType: "CHAT_COMPLETION",
          payload: { message }
        }
      });
      return NextResponse.json({ 
        error: "Action requires human approval", 
        blocked: true, 
        status: "PENDING_APPROVAL",
        reason: policy.reason 
      }, { status: 202 });
    }
    return NextResponse.json({ error: `Policy violation: ${policy.reason}`, blocked: true }, { status: 403 });
  }

  let convId = conversationId;
  if (!convId) {
    const newConv = await prisma.conversation.create({
      data: { agentId, organizationId: session.organizationId },
    });
    convId = newConv.id;
  }

  const history = await prisma.message.findMany({
    where: { conversationId: convId },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const chatMessages = [
    { role: "system", content: agent.instructions || "You are a helpful assistant." },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: message },
  ];

  try {
    await prisma.message.create({
      data: { conversationId: convId, role: "user", content: message },
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages as any,
    });

    const aiContent = response.choices[0].message.content || "No response generated.";

    await prisma.message.create({
      data: { conversationId: convId, role: "assistant", content: aiContent },
    });

    return NextResponse.json({ content: aiContent, conversationId: convId });
  } catch (err) {
    return NextResponse.json({ error: "AI Response failed" }, { status: 500 });
  }
}