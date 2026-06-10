import { ProviderAdapter, ChatRequest, ChatResponse, KeyCheckResult } from "./types";
import { providerFetch } from "../http";
import { runAuthCheck } from "./connection-test";

export class GeminiAdapter implements ProviderAdapter {
  provider = "gemini";

  async validateKey(apiKey: string): Promise<KeyCheckResult> {
    // Listing models authenticates the key with no token cost. Key goes in a
    // header rather than the query string so it never lands in logs/proxies.
    return runAuthCheck(
      "https://generativelanguage.googleapis.com/v1beta/models",
      { method: "GET", headers: { "x-goog-api-key": apiKey } },
      { provider: this.provider },
    );
  }

  async chat(request: ChatRequest, apiKey: string): Promise<ChatResponse> {
    const start = Date.now();

    // Gemini has no system role; fold any system prompt into systemInstruction.
    const systemMessage = request.messages.find((m) => m.role === "system")?.content;
    const contents = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent`;

    const data = await providerFetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass the key via header rather than the query string so it never
          // lands in logs/proxies.
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents,
          ...(systemMessage
            ? { systemInstruction: { parts: [{ text: systemMessage }] } }
            : {}),
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.max_tokens,
          },
        }),
      },
      { provider: this.provider },
    );

    return {
      id: crypto.randomUUID(),
      provider: this.provider,
      model: request.model,
      choices: [
        {
          message: {
            role: "assistant",
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
          },
          finish_reason: data.candidates?.[0]?.finishReason
            ? String(data.candidates[0].finishReason).toLowerCase()
            : "stop",
        },
      ],
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0,
      },
      latencyMs: Date.now() - start,
    };
  }
}
