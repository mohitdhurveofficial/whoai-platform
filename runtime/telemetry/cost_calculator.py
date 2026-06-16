"""
Cost calculator — thin re-export of pricing.py for backward compatibility.
All new code should import from runtime.telemetry.pricing directly.
"""
from runtime.telemetry.pricing import calculate_cost  # noqa: F401
