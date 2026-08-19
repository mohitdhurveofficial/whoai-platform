"""Provider routing: the registry drives which adapter serves which vendor.

providers.json is the contract both planes read. These tests pin the routing the
gateway performs to the entries in that file, so adding a vendor cannot silently
send its traffic to the wrong endpoint.
"""
import pytest
from runtime.providers.provider_factory import PROVIDERS, ProviderFactory
from runtime.providers.openai_provider import OpenAIProvider
from runtime.providers.anthropic_provider import AnthropicProvider
from runtime.providers.gemini_provider import GeminiProvider


def test_provider_factory():
    assert isinstance(ProviderFactory.get_provider("openai"), OpenAIProvider)
    assert isinstance(ProviderFactory.get_provider("anthropic"), AnthropicProvider)
    assert isinstance(ProviderFactory.get_provider("gemini"), GeminiProvider)

    with pytest.raises(ValueError):
        ProviderFactory.get_provider("unknown")


def test_every_registered_provider_can_be_built():
    """A vendor listed in providers.json must be routable — no dead entries."""
    for name in ProviderFactory.available():
        assert ProviderFactory.get_provider(name, api_key="test") is not None


def test_openai_compatible_vendors_share_one_adapter():
    """Groq, DeepSeek, xAI et al. differ only by base URL, not by class."""
    for name, entry in PROVIDERS.items():
        if entry["api"] == "openai":
            assert isinstance(ProviderFactory.get_provider(name, api_key="test"), OpenAIProvider)


@pytest.mark.parametrize(
    "name,expected",
    [
        ("grok", "https://api.x.ai/v1"),
        ("deepseek", "https://api.deepseek.com"),
        ("groq", "https://api.groq.com/openai/v1"),
        ("openai", "https://api.openai.com/v1"),
    ],
)
def test_vendors_are_pointed_at_their_own_endpoint(name, expected):
    provider = ProviderFactory.get_provider(name, api_key="test")
    assert str(provider.client.base_url).rstrip("/") == expected


def test_byok_instances_are_never_cached():
    """A decrypted customer key must not be reachable by another org."""
    a = ProviderFactory.get_provider("openai", api_key="org-a-key")
    b = ProviderFactory.get_provider("openai", api_key="org-b-key")
    assert a is not b
    assert a.api_key == "org-a-key"
    assert b.api_key == "org-b-key"
    # ...and the shared platform singleton holds neither of them.
    assert ProviderFactory.get_provider("openai") is not a


def test_self_hosted_providers_do_not_require_a_key():
    """Ollama and a private OpenAI-compatible endpoint authenticate by network."""
    keyless = [n for n, e in PROVIDERS.items() if not e.get("keyRequired", True)]
    assert keyless, "expected at least one self-hosted entry in providers.json"
    for name in keyless:
        assert ProviderFactory.get_provider(name).key_required is False


@pytest.mark.asyncio
async def test_health_check_without_a_key_is_unhealthy_not_an_error():
    provider = OpenAIProvider(api_key=None, key_env="WHOAI_UNSET_KEY_ENV")
    assert await provider.health_check() == "unhealthy"
