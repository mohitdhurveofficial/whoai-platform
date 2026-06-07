"""
Model Pricing Registry for WHOAI Telemetry Engine.
Single source of truth for pricing calculations across the platform.
"""

# Pricing per 1,000 tokens in USD
MODEL_PRICING = {
    # OpenAI
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-4.1": {"input": 0.005, "output": 0.015},
    "gpt-4-turbo": {"input": 0.01, "output": 0.03},
    "gpt-5": {"input": 0.015, "output": 0.045}, # Placeholder
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    
    # Anthropic
    "claude-3-5-sonnet": {"input": 0.003, "output": 0.015},
    "claude-3-5-sonnet-20240620": {"input": 0.003, "output": 0.015},
    "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
    "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
    
    # Gemini
    "gemini-2.5-pro": {"input": 0.00125, "output": 0.00375},
    "gemini-2.5-flash": {"input": 0.000075, "output": 0.0003},
    
    # Grok
    "grok-2": {"input": 0.002, "output": 0.01},
    "grok-2-latest": {"input": 0.002, "output": 0.01},
    
    # DeepSeek
    "deepseek-chat": {"input": 0.00014, "output": 0.00028},
    "deepseek-reasoner": {"input": 0.00055, "output": 0.00219}
}

def get_pricing(model: str) -> dict:
    """
    Get pricing for a specific model, defaulting to gpt-4o if unknown.
    """
    model_lower = model.lower()
    if model_lower in MODEL_PRICING:
        return MODEL_PRICING[model_lower]
        
    for key, pricing in MODEL_PRICING.items():
        if key in model_lower:
            return pricing
            
    return MODEL_PRICING["gpt-4o"]

def calculate_cost(model: str, tokens_in: int, tokens_out: int) -> float:
    """
    Calculate the total cost of a request.
    """
    pricing = get_pricing(model)
    cost_in = (tokens_in / 1000.0) * pricing["input"]
    cost_out = (tokens_out / 1000.0) * pricing["output"]
    return cost_in + cost_out
