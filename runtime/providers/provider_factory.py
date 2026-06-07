from typing import Dict
from runtime.providers.base import BaseProvider
from runtime.providers.openai_provider import OpenAIProvider
from runtime.providers.anthropic_provider import AnthropicProvider
from runtime.providers.gemini_provider import GeminiProvider
from runtime.providers.grok_provider import GrokProvider
from runtime.providers.deepseek_provider import DeepSeekProvider

class ProviderFactory:
    _providers: Dict[str, BaseProvider] = {}

    @classmethod
    def get_provider(cls, provider_name: str, **kwargs) -> BaseProvider:
        provider_name = provider_name.lower()
        if provider_name in cls._providers:
            return cls._providers[provider_name]

        if provider_name == "openai":
            provider = OpenAIProvider(**kwargs)
        elif provider_name == "anthropic":
            provider = AnthropicProvider(**kwargs)
        elif provider_name == "gemini":
            provider = GeminiProvider(**kwargs)
        elif provider_name == "grok":
            provider = GrokProvider(**kwargs)
        elif provider_name == "deepseek":
            provider = DeepSeekProvider(**kwargs)
        else:
            raise ValueError(f"Unknown provider: {provider_name}")

        cls._providers[provider_name] = provider
        return provider
