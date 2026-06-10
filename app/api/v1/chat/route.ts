import OpenAI from "openai";
import { validateApiKey } from "@/lib/security/validate-api-key";
import { prisma } from "@/lib/prisma";
import { checkBudget } from "@/lib/budget/check-budget";
import { SpendEngine } from "@/lib/spend-engine";
import { UsageEngine } from "@/lib/usage-engine";
import { corsHeaders, corsPreflight, rateLimit } from "@/lib/gateway/cors";

export function OPTIONS() {
  return corsPreflight();
}

function json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
  return Response.json(body, {
    status: init?.status ?? 200,
    headers: { ...corsHeaders, ...(init?.headers ?? {}) },
  });
}

function getGroqClient() {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY missing");
  }

  return new OpenAI({
    apiKey: groqApiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function POST(req: Request) {
  try {
    const openai = getGroqClient();

    const auth = req.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
      return json({ error: "Missing API Key" }, { status: 401 });
    }

    const key = auth.replace("Bearer ", "");

    const apiKey = await validateApiKey(key);

    if (!apiKey) {
      return json({ error: "Invalid API Key" }, { status: 401 });
    }

    const limit = rateLimit(apiKey.id);
    if (!limit.allowed) {
      return json(
        { error: "Rate limit exceeded. Slow down." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    const allowed = await checkBudget(apiKey.organizationId);

    if (!allowed) {
      return json(
        { error: "Budget exceeded" },
        { status: 402 }
      );
    }

    const body = await req.json();

    if (!body?.messages) {
      return json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Attribute spend to a real agent the caller owns — never a hardcoded id.
    const agentId = req.headers.get("x-agent-id") || body.agent_id;
    if (!agentId) {
      return json(
        { error: "x-agent-id header or agent_id in body is required" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.findFirst({
      where: { id: agentId, organizationId: apiKey.organizationId },
      select: { id: true, status: true },
    });
    if (!agent) {
      return json(
        { error: "Agent not found or does not belong to your organization" },
        { status: 403 }
      );
    }
    if (agent.status !== "ACTIVE") {
      return json({ error: `Agent is ${agent.status}` }, { status: 403 });
    }

    const start = Date.now();

    const completion = await openai.chat.completions.create({
      model: body.model || "llama-3.3-70b-versatile",
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
    });

    const latency = Date.now() - start;

    const promptTokens = completion.usage?.prompt_tokens || 0;
    const completionTokens = completion.usage?.completion_tokens || 0;
    const totalTokens = promptTokens + completionTokens;

    const cost =
      promptTokens * 0.00000015 +
      completionTokens * 0.0000006;

    try {
  await SpendEngine.recordSpend({
    organizationId: apiKey.organizationId,
    agentId: agent.id,
    model: body.model || "llama-3.3-70b-versatile",
    provider: "groq",
    tokensIn: promptTokens,
    tokensOut: completionTokens,
    cost,
    metadata: {
      totalTokens,
    },
  });

  try {
    await UsageEngine.updateUsage({
      organizationId: apiKey.organizationId,
      agentId: agent.id,
      tokens: totalTokens,
      cost,
    });
  } catch (e) {
    console.error("USAGE ENGINE FAILED");
    console.error(e);
  }

  await prisma.requestLog.create({
    data: {
      organizationId: apiKey.organizationId,
      agentId: agent.id,
      provider: "groq",
      model: body.model || "llama-3.3-70b-versatile",
      requestPayloadSize: JSON.stringify(body).length,
      statusCode: 200,
      latencyMs: latency,
    },
  });
} catch (error) {
  console.error("SPEND ERROR");
  console.error(error);
  throw error;
}

    return json(completion);
  } catch (error) {
    console.error("Chat API Error:", error);

    return json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}