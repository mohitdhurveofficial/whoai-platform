console.log("Database configured:", !!process.env.DATABASE_URL);
import OpenAI from "openai";
import { validateApiKey } from "@/lib/security/validate-api-key";
import { prisma } from "@/lib/prisma";
import { checkBudget } from "@/lib/budget/check-budget"; // add this
import { SpendEngine } from "@/lib/spend-engine";
import { UsageEngine } from "@/lib/usage-engine";

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
    console.log("STEP 0: REQUEST RECEIVED");

    const openai = getGroqClient();

    const auth = req.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Missing API Key" },
        { status: 401 }
      );
    }

    const key = auth.replace("Bearer ", "");

    const apiKey = await validateApiKey(key);

    if (!apiKey) {
      return Response.json(
        { error: "Invalid API Key" },
        { status: 401 }
      );
    }

    const allowed = await checkBudget(apiKey.organizationId);

    if (!allowed) {
      return Response.json(
        { error: "Budget exceeded" },
        { status: 402 }
      );
    }

    const body = await req.json();

    if (!body?.messages) {
      return Response.json(
        { error: "Messages are required" },
        { status: 400 }
      );
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

    const DEFAULT_AGENT_ID =
      "c2853d1e-46f1-41e4-a890-66d29ca6f99d";

    try {
  await SpendEngine.recordSpend({
    organizationId: apiKey.organizationId,
    agentId: DEFAULT_AGENT_ID,
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
      agentId: DEFAULT_AGENT_ID,
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
      agentId: DEFAULT_AGENT_ID,
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

    return Response.json(completion);
  } catch (error) {
    console.error("Chat API Error:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}