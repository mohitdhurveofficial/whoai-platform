"""
Cost calculator for WHOAI Telemetry Engine.
"""
from decimal import Decimal, getcontext
from runtime.telemetry.pricing import get_pricing

# Set sufficient precision for financial operations
getcontext().prec = 28

def calculate_cost(model: str, tokens_in: int, tokens_out: int) -> Decimal:
    """
    Calculate the exact request cost given the model and token counts.
    Formula: (tokens_in / 1000 * input_price) + (tokens_out / 1000 * output_price)
    """
    pricing = get_pricing(model)
    
    # Use Decimal for all calculations to prevent float accumulation issues
    input_price = Decimal(str(pricing["input"]))
    output_price = Decimal(str(pricing["output"]))
    
    d_tokens_in = Decimal(tokens_in)
    d_tokens_out = Decimal(tokens_out)
    d_1000 = Decimal(1000)
    
    cost_in = (d_tokens_in / d_1000) * input_price
    cost_out = (d_tokens_out / d_1000) * output_price
    
    total_cost = cost_in + cost_out
    
    # Return quantified to 8 decimal places for SpendLog storage
    return total_cost.quantize(Decimal('0.00000000'))
