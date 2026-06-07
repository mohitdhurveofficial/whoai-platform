import { ProviderAdapter, ChatRequest, ChatResponse } from "./types";

export class GeminiAdapter implements ProviderAdapter {
  provider = "gemini";

  async chat(request: ChatRequest, apiKey: string): Promise<ChatResponse> {
    const start = Date.now();
    
    // Quick mapping for Gemini contents array
    const contents = request.messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.max_tokens,
        }
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Gemini Error: ${data.error?.message || res.statusText}`);
    }

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
          finish_reason: "stop",
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
