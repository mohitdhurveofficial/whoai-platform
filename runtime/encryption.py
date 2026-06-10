"""AES-256-GCM decryption for BYOK provider credentials.

This is the Python counterpart of lib/encryption.ts. Credentials are encrypted
by the Next.js control plane and stored in ProviderCredential.encryptedApiKey;
the gateway decrypts them here to call providers with the customer's own key.

Format (matching the TS implementation):
    "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
Key: ENCRYPTION_KEY env var, 32 bytes encoded as 64 hex characters.
"""

import os

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def _key() -> bytes:
    key_hex = os.getenv("ENCRYPTION_KEY")
    if not key_hex:
        raise RuntimeError("ENCRYPTION_KEY environment variable is not set")
    key = bytes.fromhex(key_hex)
    if len(key) != 32:
        raise RuntimeError("ENCRYPTION_KEY must be 32 bytes (64 hex characters)")
    return key


def decrypt(payload: str) -> str:
    """Decrypt an "iv:authTag:ciphertext" payload produced by lib/encryption.ts."""
    parts = payload.split(":")
    if len(parts) != 3:
        raise ValueError("Invalid encrypted text format")

    iv_hex, auth_tag_hex, ciphertext_hex = parts
    iv = bytes.fromhex(iv_hex)
    auth_tag = bytes.fromhex(auth_tag_hex)
    ciphertext = bytes.fromhex(ciphertext_hex)

    decryptor = Cipher(
        algorithms.AES(_key()),
        modes.GCM(iv, auth_tag),
    ).decryptor()

    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    return plaintext.decode("utf-8")


def encrypt(plaintext: str) -> str:
    """Encrypt to the same "iv:authTag:ciphertext" hex format as lib/encryption.ts.

    Production credentials are encrypted by the Next.js control plane; this
    counterpart exists for parity and for tooling/tests (e.g. seeding a
    ProviderCredential the gateway can decrypt). Uses a 16-byte IV to match the
    TS implementation.
    """
    iv = os.urandom(16)
    encryptor = Cipher(
        algorithms.AES(_key()),
        modes.GCM(iv),
    ).encryptor()
    ciphertext = encryptor.update(plaintext.encode("utf-8")) + encryptor.finalize()
    return f"{iv.hex()}:{encryptor.tag.hex()}:{ciphertext.hex()}"
