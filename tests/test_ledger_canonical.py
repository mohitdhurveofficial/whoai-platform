"""Cross-language ledger golden-vector tests (Python side).

Asserts the Python primitives reproduce every canonical string, record hash,
and signature in lib/ledger/golden-vectors.json — the same file the TS suite
(__tests__/ledger-canonical.test.ts) checks. If both pass, the Python gateway
and the TS reference verifier agree byte-for-byte.
"""

import json
from pathlib import Path

import pytest

from runtime.ledger import (
    canonicalize,
    compute_record_hash,
    key_id,
    public_raw_from_seed,
    sign_hash,
    verify_hash,
)
from runtime.ledger.canonical import GENESIS_PREV_HASH, record_body

VECTORS = json.loads(
    (Path(__file__).resolve().parents[1] / "lib" / "ledger" / "golden-vectors.json").read_text(
        encoding="utf-8"
    )
)


def test_genesis_constant():
    assert GENESIS_PREV_HASH == "0" * 64


@pytest.mark.parametrize("vec", VECTORS["canonical"], ids=[v["name"] for v in VECTORS["canonical"]])
def test_canonical_and_hash_match_golden_vectors(vec):
    assert canonicalize(record_body(vec["record"])).decode("utf-8") == vec["canonical"]
    assert compute_record_hash(vec["record"]) == vec["recordHash"]


def test_floats_are_rejected():
    with pytest.raises(TypeError):
        canonicalize({"cost": 0.1})


def test_signing_cross_language():
    s = VECTORS["signing"]
    seed = bytes.fromhex(s["seedHex"])
    assert public_raw_from_seed(seed).hex() == s["publicKeyRawHex"]
    assert key_id(bytes.fromhex(s["publicKeyRawHex"])) == s["keyId"]
    assert sign_hash(seed, s["recordHashHex"]) == s["signatureHex"]
    pub = bytes.fromhex(s["publicKeyRawHex"])
    assert verify_hash(pub, s["recordHashHex"], s["signatureHex"]) is True
    tampered = s["recordHashHex"][:-1] + ("1" if s["recordHashHex"].endswith("0") else "0")
    assert verify_hash(pub, tampered, s["signatureHex"]) is False
