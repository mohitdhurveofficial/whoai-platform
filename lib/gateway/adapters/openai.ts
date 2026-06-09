import { ProviderAdapter, ChatRequest, ChatResponse } from "./types";
import { providerFetch } from "../http";

export class OpenAIAdapter implements ProviderAdapter {
  provider = "openai";

  async chat(request: ChatRequest, apiKey: string): Promise<ChatResponse> {
    const start = Date.now();
    const data = await providerFetch(
      "https://api.openai.com/v1/chat/completions",
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
