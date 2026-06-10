from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest

from runtime.encryption import decrypt
from runtime.providers.openai_provider import OpenAIProvider
from runtime.providers.provider_factory import ProviderFactory
from runtime.routers.gateway import get_org_provider_key

# A fixed AES-256-GCM key (64 hex chars) and a ciphertext produced by Node's
# crypto using the exact scheme in lib/encryption.ts. Decrypting it in Python
# proves the two implementations are interoperable.
TEST_KEY = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
NODE_VECTOR = (
    "aabbccddeeff00112233445566778899:"
    "28f34bf9835b349447b92bb5d73aac6d:"
    "a6658dd0a7f6d92e8ce7b805bf735f7647a035c7e49b4107046a565344"
)
EXPECTED_PLAINTEXT = "sk-byok-test-secret-value-123"


def test_decrypt_matches_node_vector(monkeypatch):
    monkeypatch.setenv("ENCRYPTION_KEY", TEST_KEY)
    assert decrypt(NODE_VECTOR) == EXPECTED_PLAINTEXT


def test_decrypt_rejects_bad_format(monkeypatch):
    monkeypatch.setenv("ENCRYPTION_KEY", TEST_KEY)
    with pytest.raises(ValueError):
        decrypt("not-a-valid-payload")


def _credential(encrypted):
    cred = MagicMock()
    cred.encryptedApiKey = encrypted
    return cred


def _db_returning(value):
    db = MagicMock()
    db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=value))
    )
    return db


@pytest.mark.asyncio
async def test_get_org_provider_key_returns_decrypted(monkeypatch):
    monkeypatch.setenv("ENCRYPTION_KEY", TEST_KEY)
    db = _db_returning(_credential(NODE_VECTOR))
    key = await get_org_provider_key(db, "org-1", "openai")
    assert key == EXPECTED_PLAINTEXT


@pytest.mark.asyncio
async def test_get_org_provider_key_none_when_absent(monkeypatch):
    monkeypatch.setenv("ENCRYPTION_KEY", TEST_KEY)
    db = _db_returning(None)
    key = await get_org_provider_key(db, "org-1", "openai")
    assert key is None


@pytest.mark.asyncio
async def test_get_org_provider_key_none_when_corrupt(monkeypatch):
    # A corrupt/undecryptable credential yields None. The gateway treats None as
    # "no usable key" and fails closed (BYOK_KEY_MISSING) — it never falls back
    # to a platform key, because WHOAI must never pay model costs.
    monkeypatch.setenv("ENCRYPTION_KEY", TEST_KEY)
    db = _db_returning(_credential("garbage:garbage:garbage"))
    key = await get_org_provider_key(db, "org-1", "openai")
    assert key is None


def test_factory_byok_instance_is_uncached_and_uses_key(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "platform-key")

    byok_a = ProviderFactory.get_provider("openai", api_key="org-a-key")
    byok_b = ProviderFactory.get_provider("openai", api_key="org-b-key")

    assert isinstance(byok_a, OpenAIProvider)
    assert byok_a.api_key == "org-a-key"
    assert byok_b.api_key == "org-b-key"
    # BYOK instances must never be shared (no cross-tenant key leakage).
    assert byok_a is not byok_b

    # Platform-key path is a cached singleton.
    platform_1 = ProviderFactory.get_provider("openai")
    platform_2 = ProviderFactory.get_provider("openai")
    assert platform_1 is platform_2
    assert platform_1 is not byok_a
