"""Build provider adapters from the shared registry.

Single source of truth: providers.json at the project root — the same file the
Next.js control plane reads (lib/providers/registry.ts). Supporting a new vendor
is one entry there, not a new class here.
"""
import json
import os
from typing import Dict, List, Optional

from runtime.providers.base import BaseProvider
from runtime.providers.openai_provider import OpenAIProvider
from runtime.providers.anthropic_provider import AnthropicProvider
from runtime.providers.gemini_provider import GeminiProvider

_registry_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "providers.json"
)

# Load once at import — matches runtime/entitlements/plans.py and keeps the
# gateway hot path off the filesystem.
with open(_registry_path, "r") as f:
    PROVIDERS: Dict[str, dict] = json.load(f)["providers"]

# Vendors whose request/response shape genuinely differs from OpenAI's. Everyone
# else is served by OpenAIProvider pointed at a different base URL.
_NATIVE_CLASSES = {
    "anthropic": AnthropicProvider,
    "gemini": GeminiProvider,
}


def _base_url(entry: dict) -> Optional[str]:
    """Resolve a provider's endpoint, letting the environment override the default.

    Self-hosted entries ship a placeholder (or no) URL precisely so an operator
    can point them at their own deployment without editing the registry.
    """
    env_name = entry.get("baseUrlEnv")
    if env_name:
        return os.getenv(env_name) or entry.get("baseUrl")
    return entry.get("baseUrl")


class ProviderFactory:
    # Cache only the platform-key singletons. Per-org (BYOK) instances are
    # never cached, so a customer's decrypted key can never leak to another org.
    _providers: Dict[str, BaseProvider] = {}

    @classmethod
    def available(cls) -> List[str]:
        """Every provider id the gateway can route to."""
        return list(PROVIDERS)

    @classmethod
    def configured(cls) -> List[str]:
        """Providers WHOAI itself holds a platform key for.

        Under strict BYOK this is usually a short list, and reporting health for
        providers we have no credential for would report failure as a fault.
        """
        return [
            name
            for name, entry in PROVIDERS.items()
            if os.getenv(entry["keyEnv"]) or not entry.get("keyRequired", True)
        ]

    @classmethod
    def get_provider(cls, provider_name: str, **kwargs) -> BaseProvider:
        provider_name = provider_name.lower()

        entry = PROVIDERS.get(provider_name)
        if entry is None:
            raise ValueError(f"Unknown provider: {provider_name}")

        # BYOK path: build a fresh, uncached instance bound to the org's key.
        if kwargs:
            return cls._build(entry, **kwargs)

        if provider_name in cls._providers:
            return cls._providers[provider_name]

        provider = cls._build(entry)
        cls._providers[provider_name] = provider
        return provider

    @staticmethod
    def _build(entry: dict, **kwargs) -> BaseProvider:
        # Resolve the platform key from the registry so the env var name lives in
        # exactly one place; an explicit BYOK key passed by the caller wins.
        kwargs.setdefault("api_key", os.getenv(entry["keyEnv"]))

        native = _NATIVE_CLASSES.get(entry["api"])
        if native is not None:
            return native(**kwargs)

        return OpenAIProvider(
            base_url=_base_url(entry),
            key_env=entry["keyEnv"],
            key_required=entry.get("keyRequired", True),
            **kwargs,
        )
