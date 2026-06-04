import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId, message, conversationId } = await req.json();

  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  // 1. Verify access to worker
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, organizationId: session.organizationId },
  });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  // 2. Find or create conversation
  let convId = conversationId;
  if (!convId) {
    const newConv = await prisma.conversation.create({
      data: { agentId, organizationId: session.organizationId },
    });
    convId = newConv.id;
  }

  // 3. Get history
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
    // 4. Save user message
    await prisma.message.create({
      data: { conversationId: convId, role: "user", content: message },
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages as any,
    });

    const aiContent = response.choices[0].message.content || "No response generated.";

    // 5. Save assistant response
    await prisma.message.create({
      data: { conversationId: convId, role: "assistant", content: aiContent },
    });

    return NextResponse.json({ content: aiContent, conversationId: convId });
  } catch (err) {
    return NextResponse.json({ error: "AI Response failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) return NextResponse.json({ error: "Agent ID required" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { conversation: { agentId, organizationId: session.organizationId } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}