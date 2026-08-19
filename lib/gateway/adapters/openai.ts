import { ProviderAdapter, ChatRequest, ChatResponse, KeyCheckResult } from "./types";
import { providerFetch } from "../http";
import { runAuthCheck } from "./connection-test";

/**
 * One adapter for OpenAI and every vendor that speaks its wire format —
 * xAI, DeepSeek, Groq, Mistral, Together, Fireworks, OpenRouter, Perplexity and
 * the rest. The request body and response shape are identical across them, so
 * the only thing that varies is the base URL, which comes from providers.json.
 */
export class OpenAICompatibleAdapter implements ProviderAdapter {
  constructor(
    readonly provider: string,
    private readonly baseUrl: string,
  ) {}

  async validateKey(apiKey: string): Promise<KeyCheckResult> {
    // GET /models is a zero-cost auth check (no tokens billed).
    return runAuthCheck(
      `${this.baseUrl}/models`,
      { method: "GET", headers: { Authorization: `Bearer ${apiKey}` } },
      { provider: this.provider },
    );
  }

  async chat(request: ChatRequest, apiKey: string): Promise<ChatResponse> {
    const start = Date.now();
    const data = await providerFetch(
      `${this.baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.max_tokens,
        }),
      },
      { provider: this.provider },
    );

    return {
      id: data.id,
      provider: this.provider,
      model: data.model,
      choices: [
        {
          message: {
            role: "assistant",
            content: data.choices?.[0]?.message?.content || "",
          },
          finish_reason: data.choices?.[0]?.finish_reason || "stop",
        },
      ],
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
      latencyMs: Date.now() - start,
    };
  }
}
