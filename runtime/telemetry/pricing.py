"""
Model Pricing Registry for WHOAI Telemetry Engine.
Single source of truth: reads from pricing.json at project root.
"""
import json
import os
import logging
from decimal import Decimal, getcontext

getcontext().prec = 28

logger = logging.getLogger("whoai.telemetry.pricing")

# Load once at module import time — avoids drift across restarts.
_pricing_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "pricing.json")
with open(_pricing_path, "r") as f:
    MODEL_PRICING = {k.lower(): v for k, v in json.load(f)["models"].items()}


def get_pricing(model: str) -> dict | None:
    """
    Return pricing dict {input: Decimal, output: Decimal} for a model.
    Returns None if the model is completely unknown.
    """
    model_lower = model.lower()

    if model_lower in MODEL_PRICING:
        raw = MODEL_PRICING[model_lower]
        return {"input": Decimal(str(raw["input"])), "output": Decimal(str(raw["output"]))}

    # Fuzzy match: does any known key appear inside the model name?
    for key, raw in MODEL_PRICING.items():
        if key in model_lower:
            return {"input": Decimal(str(raw["input"])), "output": Decimal(str(raw["output"]))}

    return None


def calculate_cost(model: str, tokens_in: int, tokens_out: int) -> Decimal:
    """
    Calculate the exact request cost in Decimal.
    Unknown models log a warning and return $0 — never silently default to gpt-4o.
    """
    pricing = get_pricing(model)
    if pricing is None:
        logger.warning(f"Unknown model '{model}' — pricing unavailable. Cost logged as $0.")
        return Decimal("0")

    d_1000 = Decimal("1000")
    cost_in = (Decimal(tokens_in) / d_1000) * pricing["input"]
    cost_out = (Decimal(tokens_out) / d_1000) * pricing["output"]
    return (cost_in + cost_out).quantize(Decimal("0.00000001"))
