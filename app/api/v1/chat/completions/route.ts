import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/security/validate-api-key";
import { getAdapter } from "@/lib/gateway/adapters";
import { decrypt } from "@/lib/encryption";
import { ChatRequest } from "@/lib/gateway/adapters/types";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API Key" }, { status: 401 });
    }

    const key = auth.replace("Bearer ", "");
    const apiKey = await validateApiKey(key);

    if (!apiKey) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    const body = await req.json();
    if (!body?.messages || !body?.provider || !body?.model) {
      return NextResponse.json({ error: "messages, provider, and model are required" }, { status: 400 });
    }

    const providerName = body.provider.toLowerCase();
    const agentId = req.headers.get("x-agent-id") || body.agent_id;

    if (!agentId) {
      return NextResponse.json({ error: "x-agent-id header or agent_id in body is required" }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({
      where: { id: agentId, organizationId: apiKey.organizationId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found or does not belong to your organization" }, { status: 403 });
    }

    if (agent.status !== "ACTIVE") {
      return NextResponse.json({ error: `Agent is ${agent.status}` }, { status: 403 });
    }

    // Load Provider Credentials
    const credential = await prisma.providerCredential.findUnique({
      where: {
        organizationId_provider: {
          organizationId: apiKey.organizationId,
          provider: providerName,
        },
      },
    });

    if (!credential || credential.status !== "CONNECTED") {
      return NextResponse.json({ error: `Provider ${providerName} is not configured or connected` }, { status: 400 });
    }

    const providerApiKey = decrypt(credential.encryptedApiKey);
    const adapter = getAdapter(providerName);

    const chatRequest: ChatRequest = {
      model: body.model,
      messages: body.messages,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      stream: body.stream, // Stream not implemented in this phase yet
    };

    if (chatRequest.stream) {
      return NextResponse.json({ error: "Streaming is not supported in this endpoint yet" }, { status: 501 });
    }

    const response = await adapter.chat(chatRequest, providerApiKey);

    // Phase 3 Integration (Placeholder for now, we will add UsageRecord soon)
    const cost = 0; // Replace with proper cost calculation later

    // TODO: Write UsageRecord

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Gateway Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Gateway Error" },
      { status: 500 }
    );
  }
}
