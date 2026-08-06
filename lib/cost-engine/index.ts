/**
 * Cost Engine — reads from pricing.json (single source of truth).
 * Unit conversion: pricing.json stores USD per 1,000 tokens.
 * This engine converts to per-token for calculation.
 */
import pricingData from "@/pricing.json";

export interface CostCalculationParams {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface CostCalculationResult {
  cost: number;
}

/** USD per 1,000 tokens, as stored in pricing.json. */
interface ModelRates {
  input: number;
  output: number;
}

// Normalise keys to lower-case once at module load.
const REGISTRY: Record<string, ModelRates> = Object.fromEntries(
  Object.entries((pricingData as { models: Record<string, ModelRates> }).models).map(
    ([model, rates]) => [model.toLowerCase(), rates]
  )
);

function getRates(model: string): ModelRates | null {
  const key = model.toLowerCase();
  if (REGISTRY[key]) return REGISTRY[key];
  // Fuzzy match: known key appears inside model name.
  for (const [known, rates] of Object.entries(REGISTRY)) {
    if (key.includes(known)) return rates;
  }
  return null;
}

export class CostEngine {
  static calculateCost({ model, inputTokens, outputTokens }: CostCalculationParams): CostCalculationResult {
    const rates = getRates(model);
    if (!rates) {
      console.warn(`[CostEngine] Unknown model "${model}" — cost returned as $0`);
      return { cost: 0 };
    }
    // pricing.json is per-1k tokens
    const inputCost = (inputTokens / 1_000) * rates.input;
    const outputCost = (outputTokens / 1_000) * rates.output;
    return { cost: Number((inputCost + outputCost).toFixed(8)) };
  }

  static updatePricing(model: string, inputPrice: number, outputPrice: number) {
    REGISTRY[model.toLowerCase()] = { input: inputPrice, output: outputPrice };
  }
}
