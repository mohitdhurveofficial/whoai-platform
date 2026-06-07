import pytest
from runtime.providers.provider_factory import ProviderFactory
from runtime.providers.base import BaseProvider
from runtime.providers.openai_provider import OpenAIProvider
from runtime.providers.anthropic_provider import AnthropicProvider

def test_provider_factory():
    provider = ProviderFactory.get_provider("openai")
    assert isinstance(provider, OpenAIProvider)
    
    provider_anthropic = ProviderFactory.get_provider("anthropic")
    assert isinstance(provider_anthropic, AnthropicProvider)
    
    with pytest.raises(ValueError):
        ProviderFactory.get_provider("unknown")

@pytest.mark.asyncio
async def test_provider_health_checks():
    # Only test initialization and basic failure modes without API keys
    provider = ProviderFactory.get_provider("openai", api_key="test")
    assert provider is not None
