export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ProviderUsageResponse {
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
  };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export interface TokenAdapter {
  extractUsage(response: ProviderUsageResponse): TokenUsage;
}

export class OpenAIAdapter implements TokenAdapter {
  extractUsage(response: ProviderUsageResponse): TokenUsage {
    return {
      promptTokens: response?.usage?.prompt_tokens || 0,
      completionTokens: response?.usage?.completion_tokens || 0,
      totalTokens: response?.usage?.total_tokens || 0,
    };
  }
}

export class AnthropicAdapter implements TokenAdapter {
  extractUsage(response: ProviderUsageResponse): TokenUsage {
    return {
      promptTokens: response?.usage?.input_tokens || 0,
      completionTokens: response?.usage?.output_tokens || 0,
      totalTokens: (response?.usage?.input_tokens || 0) + (response?.usage?.output_tokens || 0),
    };
  }
}

export class GeminiAdapter implements TokenAdapter {
  extractUsage(response: ProviderUsageResponse): TokenUsage {
    return {
      promptTokens: response?.usageMetadata?.promptTokenCount || 0,
      completionTokens: response?.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response?.usageMetadata?.totalTokenCount || 0,
    };
  }
}

export class GrokAdapter implements TokenAdapter {
  extractUsage(response: ProviderUsageResponse): TokenUsage {
    // Grok uses OpenAI-compatible API
    return {
      promptTokens: response?.usage?.prompt_tokens || 0,
      completionTokens: response?.usage?.completion_tokens || 0,
      totalTokens: response?.usage?.total_tokens || 0,
    };
  }
}

export class OpenRouterAdapter implements TokenAdapter {
  extractUsage(response: ProviderUsageResponse): TokenUsage {
    // OpenRouter uses OpenAI-compatible API usage format mostly
    return {
      promptTokens: response?.usage?.prompt_tokens || 0,
      completionTokens: response?.usage?.completion_tokens || 0,
      totalTokens: response?.usage?.total_tokens || 0,
    };
  }
}

export class TokenEngine {
  static getAdapter(provider: string): TokenAdapter {
    switch (provider.toLowerCase()) {
      case 'openai': return new OpenAIAdapter();
      case 'anthropic': return new AnthropicAdapter();
      case 'gemini': return new GeminiAdapter();
      case 'grok': return new GrokAdapter();
      case 'openrouter': return new OpenRouterAdapter();
      default: return new OpenAIAdapter(); // default fallback
    }
  }

  static extractUsage(provider: string, response: ProviderUsageResponse): TokenUsage {
    const adapter = this.getAdapter(provider);
    return adapter.extractUsage(response);
  }
}
