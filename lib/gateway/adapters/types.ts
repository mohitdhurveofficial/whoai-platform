export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

export type ChatResponse = {
  id: string;
  provider: string;
  model: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latencyMs: number;
};

export interface ProviderAdapter {
  provider: string;
  chat(request: ChatRequest, apiKey: string): Promise<ChatResponse>;
  // Lightweight, low-cost auth check used by the "Test connection" action.
  // Resolves { ok: true } when the key authenticates, { ok: false, detail }
  // otherwise. Must never return or log the key itself.
  validateKey(apiKey: string): Promise<KeyCheckResult>;
}

export type KeyCheckResult = { ok: boolean; detail?: string };
