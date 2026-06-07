import { ProviderAdapter, ChatRequest, ChatResponse } from "./types";

// DeepSeek is an OpenAI-compatible API
export class DeepSeekAdapter implements ProviderAdapter {
  provider = "deepseek";

  async chat(request: ChatRequest, apiKey: string): Promise<ChatResponse> {
    const start = Date.now();
    const res = await fetch("https://api.deepseek.com/chat/completions", {
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
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`DeepSeek Error: ${data.error?.message || res.statusText}`);
    }

    return {
      id: data.id,
      provider: this.provider,
      model: data.model,
      choices: [
        {
          message: {
            role: "assistant",
            content: data.choices[0]?.message?.content || "",
          },
          finish_reason: data.choices[0]?.finish_reason || "stop",
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
