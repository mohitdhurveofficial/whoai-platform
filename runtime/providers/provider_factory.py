from typing import Dict
from runtime.providers.base import BaseProvider
from runtime.providers.openai_provider import OpenAIProvider
from runtime.providers.anthropic_provider import AnthropicProvider
from runtime.providers.gemini_provider import GeminiProvider
from runtime.providers.grok_provider import GrokProvider
from runtime.providers.deepseek_provider import DeepSeekProvider

_PROVIDER_CLASSES = {
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "gemini": GeminiProvider,
    "grok": GrokProvider,
    "deepseek": DeepSeekProvider,
}


class ProviderFactory:
    # Cache only the platform-key singletons. Per-org (BYOK) instances are
    # never cached, so a customer's decrypted key can never leak to another org.
    _providers: Dict[str, BaseProvider] = {}

    @classmethod
    def get_provider(cls, provider_name: str, **kwargs) -> BaseProvider:
        provider_name = provider_name.lower()

        if provider_name not in _PROVIDER_CLASSES:
            raise ValueError(f"Unknown provider: {provider_name}")

        # BYOK path: build a fresh, uncached instance bound to the org's key.
        if kwargs:
            return _PROVIDER_CLASSES[provider_name](**kwargs)

        if provider_name in cls._providers:
            return cls._providers[provider_name]

        provider = _PROVIDER_CLASSES[provider_name]()
        cls._providers[provider_name] = provider
        return provider
