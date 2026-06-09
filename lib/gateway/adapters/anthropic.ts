import { ProviderAdapter, ChatRequest, ChatResponse } from "./types";
import { providerFetch } from "../http";

export class AnthropicAdapter implements ProviderAdapter {
  provider = "anthropic";

  async chat(request: ChatRequest, apiKey: string): Promise<ChatResponse> {
    const start = Date.now();

    // Anthropic takes the system prompt as a top-level field, not a message.
    const systemMessage = request.messages.find((m) => m.role === "system")?.content;
    const messages = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const data = await providerFetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model,
          messages,
          system: systemMessage,
          temperature: request.temperature ?? 0.7,
          // Anthropic requires max_tokens; default when the caller omits it.
          max_tokens: request.max_tokens || 1024,
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
            content: data.content?.[0]?.text || "",
          },
          finish_reason: data.stop_reason === "end_turn" ? "stop" : data.stop_reason,
        },
      ],
      usage: {
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      latencyMs: Date.now() - start,
    };
  }
}
