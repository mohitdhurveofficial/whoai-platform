"""Ed25519 signing for ledger records. Mirror of ``lib/ledger/signing.ts``.

Signatures are computed over the record-hash **hex string's ASCII bytes**.
Ed25519 is deterministic (RFC 8032), so the same seed + message yields the same
signature in Python (``cryptography``) and Node (``crypto``) — which is what
lets the cross-language golden vectors assert byte-identical signatures.

LEDGER-5 keeps this pure: functions take key material as arguments. Key
custody (env/KMS), the published-key endpoint, and the rotation registry are
later tickets (LEDGER-8 / LEDGER-12).
"""

from __future__ import annotations

import hashlib
import os

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)


def generate_seed() -> bytes:
    """Return a fresh 32-byte Ed25519 private seed."""
    return os.urandom(32)


def _private_from_seed(seed: bytes) -> Ed25519PrivateKey:
    if len(seed) != 32:
        raise ValueError("Ed25519 seed must be 32 bytes")
    return Ed25519PrivateKey.from_private_bytes(seed)


def public_raw_from_seed(seed: bytes) -> bytes:
    """Return the 32-byte raw public key for a private seed."""
    return _private_from_seed(seed).public_key().public_bytes(
        serialization.Encoding.Raw, serialization.PublicFormat.Raw
    )


def sign_hash(seed: bytes, record_hash_hex: str) -> str:
    """Sign a record hash (hex) and return the signature as hex."""
    priv = _private_from_seed(seed)
    return priv.sign(record_hash_hex.encode("ascii")).hex()


def verify_hash(public_raw: bytes, record_hash_hex: str, signature_hex: str) -> bool:
    """Verify a hex signature over a record hash with a 32-byte raw public key."""
    pub = Ed25519PublicKey.from_public_bytes(public_raw)
    try:
        pub.verify(bytes.fromhex(signature_hex), record_hash_hex.encode("ascii"))
        return True
    except InvalidSignature:
        return False


def key_id(public_raw: bytes) -> str:
    """Stable, short identifier for a signing key (goes in ``signingKeyId``)."""
    return "ed25519-" + hashlib.sha256(public_raw).hexdigest()[:16]
