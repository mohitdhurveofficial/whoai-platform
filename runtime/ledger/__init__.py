"""WHOAI enforcement ledger — cross-language primitives (LEDGER-5).

This package holds the byte-exact canonical serialization, SHA-256 chaining,
and Ed25519 signing used to make the enforcement ledger tamper-evident. It is
the Python half of a two-language contract; the TypeScript mirror lives in
``lib/ledger/`` and the shared regression fixtures in
``lib/ledger/golden-vectors.json``.

Any change to canonical.py MUST be mirrored in lib/ledger/canonical.ts and the
golden vectors regenerated, or the Python gateway and the TS reference verifier
will disagree and every signature will appear invalid.
"""

from runtime.ledger.canonical import (
    GENESIS_PREV_HASH,
    canonicalize,
    compute_record_hash,
    record_body,
    sha256_hex,
)
from runtime.ledger.signing import (
    key_id,
    public_raw_from_seed,
    sign_hash,
    verify_hash,
)

__all__ = [
    "GENESIS_PREV_HASH",
    "canonicalize",
    "compute_record_hash",
    "record_body",
    "sha256_hex",
    "key_id",
    "public_raw_from_seed",
    "sign_hash",
    "verify_hash",
]
