"""
Model Pricing Registry for WHOAI Telemetry Engine.
Single source of truth for pricing calculations across the platform.
"""

# Pricing per 1,000 tokens in USD
MODEL_PRICING = {
    # OpenAI
    "gpt-4o": {
        "input": 0.005,
        "output": 0.015
    },
    "gpt-4o-mini": {
        "input": 0.00015,
        "output": 0.0006
    },
    "gpt-4.1": {
        "input": 0.005,
        "output": 0.015
    },
    "gpt-4-turbo": {
        "input": 0.01,
        "output": 0.03
    },
    "gpt-3.5-turbo": {
        "input": 0.0005,
        "output": 0.0015
    },
    
    # Anthropic
    "claude-3-5-sonnet": {
        "input": 0.003,
        "output": 0.015
    },
    "claude-3-5-sonnet-20240620": {
        "input": 0.003,
        "output": 0.015
    },
    "claude-3-opus-20240229": {
        "input": 0.015,
        "output": 0.075
    },
    "claude-3-haiku": {
        "input": 0.00025,
        "output": 0.00125
    },
    "claude-3-haiku-20240307": {
        "input": 0.00025,
        "output": 0.00125
    }
}

def get_pricing(model: str) -> dict:
    """
    Get pricing for a specific model, defaulting to gpt-4o if unknown.
    """
    model_lower = model.lower()
    if model_lower in MODEL_PRICING:
        return MODEL_PRICING[model_lower]
        
    # Attempt substring matching for slightly different model names (e.g. claude-3-5-sonnet-v2)
    for key, pricing in MODEL_PRICING.items():
        if key in model_lower:
            return pricing
            
    # Fallback default
    return MODEL_PRICING["gpt-4o"]
