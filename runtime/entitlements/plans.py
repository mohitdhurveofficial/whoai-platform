"""
Subscription plan entitlements for the runtime.

Single source of truth: reads plans.json at the project root — the same file the
Next.js control plane reads (lib/subscription.ts). The gateway enforces the
monthly request quota, so it has to agree exactly with the number the pricing
page and billing UI show; a hand-copied table in Python is how those two drift
apart and customers get blocked at a limit they were never sold.

`None` means unlimited.
"""
import json
import os
from typing import Optional

_plans_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plans.json"
)

# Load once at import — matches runtime/telemetry/pricing.py and avoids
# re-reading the file on every request in the gateway hot path.
with open(_plans_path, "r") as f:
    PLANS = {tier.upper(): limits for tier, limits in json.load(f)["plans"].items()}

DEFAULT_TIER = "FREE"

# Tiers that no longer exist but may still be stored on an Organization or held
# in Stripe metadata predating the rename. Mirrors LEGACY_TIER_ALIASES in
# lib/subscription.ts. Without this, a row still reading "PRO" would normalize to
# FREE and the gateway would start rejecting a paying customer's traffic at the
# 50k free-tier quota.
LEGACY_TIER_ALIASES = {"PRO": "BUSINESS"}


def normalize_tier(tier: Optional[str]) -> str:
    """Map an arbitrary (possibly null/unknown) tier string to a known plan.

    Mirrors normalizeTier() in lib/subscription.ts: unknown tiers fall back to
    FREE rather than raising, so a bad value in the database degrades to the
    most restrictive plan instead of failing the request open.
    """
    key = (tier or DEFAULT_TIER).upper()
    if key in PLANS:
        return key
    return LEGACY_TIER_ALIASES.get(key, DEFAULT_TIER)


def plan_config(tier: Optional[str]) -> dict:
    """Full entitlement dict for a tier."""
    return PLANS[normalize_tier(tier)]


def monthly_request_quota(tier: Optional[str]) -> Optional[int]:
    """Monthly request allowance for a tier, or None when unlimited."""
    return plan_config(tier).get("monthlyRequests")


def retention_days(tier: Optional[str]) -> int:
    """Telemetry retention window for a tier, in days."""
    return plan_config(tier)["retentionDays"]


def has_feature(tier: Optional[str], feature: str) -> bool:
    """True if `tier` includes `feature`. Mirrors hasFeature() in lib/subscription.ts.

    Defaults to False for an unrecognised feature name rather than raising: the
    gateway sits in the request path, and a typo here should close a capability
    rather than 500 every call that touches it.
    """
    return plan_config(tier).get("features", {}).get(feature, False) is True
