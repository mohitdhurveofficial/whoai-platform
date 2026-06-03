import logging

logger = logging.getLogger(__name__)

# Prices per 1,000 tokens (USD)
MODEL_PRICING = {
    # OpenAI
    "gpt-4o": {"prompt": 0.005, "completion": 0.015},
    "gpt-4o-mini": {"prompt": 0.00015, "completion": 0.0006},
    "gpt-3.5-turbo": {"prompt": 0.0005, "completion": 0.0015},
    
    # Anthropic
    "claude-3-opus-20240229": {"prompt": 0.015, "completion": 0.075},
    "claude-3-5-sonnet-20240620": {"prompt": 0.003, "completion": 0.015},
    "claude-3-haiku-20240307": {"prompt": 0.00025, "completion": 0.00125},
}

def calculate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    rates = MODEL_PRICING.get(model)
    if not rates:
        logger.warning(f"Pricing not found for model {model}. Defaulting to 0.")
        return 0.0
    
    return (prompt_tokens / 1000.0 * rates["prompt"]) + (completion_tokens / 1000.0 * rates["completion"])