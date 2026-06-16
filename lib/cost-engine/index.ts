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

// Normalise keys to lower-case once at module load.
const REGISTRY: Record<string, { input: number; output: number }> = Object.fromEntries(
  Object.entries((pricingData as any).models).map(([k, v]) => [k.toLowerCase(), v as any])
);

function getRates(model: string): { input: number; output: number } | null {
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
      // eslint-disable-next-line no-console
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
