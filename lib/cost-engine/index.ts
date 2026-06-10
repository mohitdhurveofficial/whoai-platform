// Cost is computed for OBSERVABILITY only. WHOAI is a strict BYOK platform:
// the customer pays OpenAI/Anthropic/etc. directly with their own key, so this
// figure is the customer's own provider spend that we surface for FinOps
// (budgets, alerts, dashboards). It is NOT a charge WHOAI bills or pays —
// WHOAI revenue is subscription + platform fee only (see REVENUE_MODEL.md).
export interface CostCalculationParams {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface CostCalculationResult {
  cost: number;
}

// Prices per 1M tokens
export const PRICING_REGISTRY: Record<string, { inputPrice: number; outputPrice: number }> = {
  'gpt-4o': { inputPrice: 5.0, outputPrice: 15.0 },
  'gpt-4o-mini': { inputPrice: 0.15, outputPrice: 0.6 },
  'gpt-4-turbo': { inputPrice: 10.0, outputPrice: 30.0 },
  'claude-3-5-sonnet-20240620': { inputPrice: 3.0, outputPrice: 15.0 },
  'claude-3-opus-20240229': { inputPrice: 15.0, outputPrice: 75.0 },
  'gemini-1.5-pro': { inputPrice: 3.5, outputPrice: 10.5 },
  'gemini-1.5-flash': { inputPrice: 0.075, outputPrice: 0.3 },
  'grok-2': { inputPrice: 2.0, outputPrice: 10.0 },
};

export class CostEngine {
  static calculateCost({ model, inputTokens, outputTokens }: CostCalculationParams): CostCalculationResult {
    // Try to find exact match or partial match
    let rates = PRICING_REGISTRY[model];
    
    if (!rates) {
      const match = Object.keys(PRICING_REGISTRY).find(k => model.includes(k) || k.includes(model));
      if (match) {
        rates = PRICING_REGISTRY[match];
      }
    }

    // Default fallback if unknown model
    if (!rates) {
      rates = { inputPrice: 0, outputPrice: 0 };
    }

    const inputCost = (inputTokens / 1_000_000) * rates.inputPrice;
    const outputCost = (outputTokens / 1_000_000) * rates.outputPrice;

    return {
      cost: Number((inputCost + outputCost).toFixed(8))
    };
  }

  static updatePricing(model: string, inputPrice: number, outputPrice: number) {
    PRICING_REGISTRY[model] = { inputPrice, outputPrice };
  }
}
