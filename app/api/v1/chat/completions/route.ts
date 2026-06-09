import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/security/validate-api-key";
import { getAdapter } from "@/lib/gateway/adapters";
import { decrypt } from "@/lib/encryption";
import { ChatRequest } from "@/lib/gateway/adapters/types";
import { GovernanceEngine } from "@/lib/services/PolicyEngine";
import { CostEngine } from "@/lib/cost-engine";
import { SpendEngine } from "@/lib/spend-engine";
import { UsageEngine } from "@/lib/usage-engine";
import { GatewayError, providerErrorToStatus } from "@/lib/gateway/http";

// Rough token estimate for the pre-flight budget check (~4 chars/token).
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Map a governance denial reason to an HTTP status.
function denialStatus(reason?: string): number {
  if (reason?.endsWith("LIMIT_EXCEEDED")) return 402; // Payment Required — budget hit
  return 403; // agent not found / quarantined / paused
}

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

    const body = await req.json().catch(() => null);
    if (!body?.messages || !body?.provider || !body?.model) {
      return NextResponse.json(
        { error: "messages, provider, and model are required" },
        { status: 400 },
      );
    }

    if (body.stream) {
      return NextResponse.json(
        { error: "Streaming is not supported on this endpoint yet" },
        { status: 501 },
      );
    }

    const providerName = String(body.provider).toLowerCase();
    const agentId = req.headers.get("x-agent-id") || body.agent_id;
    if (!agentId) {
      return NextResponse.json(
        { error: "x-agent-id header or agent_id in body is required" },
        { status: 400 },
      );
    }

    // --- Governance: budget + kill-switch + agent/org validation on the hot path ---
    const inputText = (body.messages as { content?: string }[])
      .map((m) => m?.content ?? "")
      .join("\n");
    const { cost: estimatedCost } = CostEngine.calculateCost({
      model: body.model,
      inputTokens: estimateTokens(inputText),
      outputTokens: body.max_tokens ?? 512,
    });

    const governance = await new GovernanceEngine().authorizeRequest({
      agentId,
      organizationId: apiKey.organizationId,
      estimatedCost,
    });

    if (!governance.allowed) {
      return NextResponse.json(
        { error: governance.reason, killSwitch: governance.killSwitch ?? false },
        { status: denialStatus(governance.reason) },
      );
    }

    // --- Resolve the org's provider credential ---
    const credential = await prisma.providerCredential.findUnique({
      where: {
        organizationId_provider: {
          organizationId: apiKey.organizationId,
          provider: providerName,
        },
      },
    });
    if (!credential || credential.status !== "CONNECTED") {
      return NextResponse.json(
        { error: `Provider ${providerName} is not configured or connected` },
        { status: 400 },
      );
    }

    const providerApiKey = decrypt(credential.encryptedApiKey);
    const adapter = getAdapter(providerName);

    const chatRequest: ChatRequest = {
      model: body.model,
      messages: body.messages,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
    };

    // --- Upstream call (timeout + retries live inside the adapter) ---
    const response = await adapter.chat(chatRequest, providerApiKey);

    // --- Spend & usage accounting (actual tokens) ---
    const { cost } = CostEngine.calculateCost({
      model: body.model,
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
    });

    try {
      await SpendEngine.recordSpend({
        organizationId: apiKey.organizationId,
        agentId,
        model: body.model,
        provider: providerName,
        tokensIn: response.usage.prompt_tokens,
        tokensOut: response.usage.completion_tokens,
        cost,
        metadata: { totalTokens: response.usage.total_tokens, latencyMs: response.latencyMs },
      });

      await UsageEngine.updateUsage({
        organizationId: apiKey.organizationId,
        agentId,
        tokens: response.usage.total_tokens,
        cost,
      });

      await prisma.requestLog.create({
        data: {
          organizationId: apiKey.organizationId,
          agentId,
          provider: providerName,
          model: body.model,
          requestPayloadSize: JSON.stringify(body).length,
          statusCode: 200,
          latencyMs: response.latencyMs,
        },
      });
    } catch (logErr) {
      // Never fail a successful completion because bookkeeping hiccuped, but make
      // it loud — under-counting spend weakens budget enforcement.
      console.error("Gateway accounting error:", logErr instanceof Error ? logErr.message : logErr);
    }

    return NextResponse.json({ ...response, cost });
  } catch (error) {
    if (error instanceof GatewayError) {
      console.error(`Gateway upstream error [${error.provider}]:`, error.message);
      return NextResponse.json(
        { error: error.message, provider: error.provider },
        { status: providerErrorToStatus(error.status) },
      );
    }
    console.error("Gateway Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Gateway Error" },
      { status: 500 },
    );
  }
}
