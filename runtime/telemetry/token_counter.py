"""
Token counting utilities for WHOAI Telemetry Engine.
"""
from typing import Dict, Any

def extract_tokens(provider: str, response: Dict[str, Any], text_content: str = "") -> Dict[str, int]:
    """
    Extract token counts from the response object.
    Falls back to length estimation if usage data is missing.
    """
    tokens_in = 0
    tokens_out = 0
    
    usage = response.get("usage") if isinstance(response, dict) else None

    if usage:
        if provider == "openai":
            tokens_in = usage.get("prompt_tokens", 0)
            tokens_out = usage.get("completion_tokens", 0)
        elif provider == "anthropic":
            tokens_in = usage.get("input_tokens", 0)
            tokens_out = usage.get("output_tokens", 0)
    
    # Fallback / Streaming approximation
    # If no usage data is provided but we have the generated text content
    if tokens_out == 0 and text_content:
        # A common heuristic is 1 token ~= 4 chars in English
        tokens_out = len(text_content) // 4
        
    # We can't perfectly fallback input tokens without the original prompt text 
    # being passed here, but often we get input tokens from the first streaming chunk.
    # In a full production setup with tiktoken, we would tokenize the prompt directly.

    total_tokens = tokens_in + tokens_out

    return {
        "tokens_in": tokens_in,
        "tokens_out": tokens_out,
        "total_tokens": total_tokens
    }

def estimate_tokens(text: str) -> int:
    """
    Fallback method to estimate tokens based on character length.
    """
    if not text:
        return 0
    return max(1, len(text) // 4)
