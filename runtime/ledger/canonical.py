"""Canonical serialization + hashing for the WHOAI enforcement ledger.

Byte-exact, cross-language (Python <-> TypeScript) canonical JSON so that a
record hashed and signed by the Python gateway verifies identically in the TS
reference verifier and the public /verify endpoint. Mirror of
``lib/ledger/canonical.ts``. Any change here MUST be mirrored there and the
golden vectors in ``lib/ledger/golden-vectors.json`` regenerated.

Canonical rules (a strict, minimal JCS-style subset chosen so both languages
produce identical bytes without depending on either runtime's JSON quirks):

  * Objects:  keys sorted by Unicode code point (ASCII keys only — enforced),
              no whitespace, ``"key":value`` pairs joined by ``,``.
  * Strings:  escape ``"`` ``\\`` and the C0 controls ``\\b \\f \\n \\r \\t``;
              any other control char (< 0x20) as ``\\u00xx`` (lowercase hex);
              non-ASCII characters are emitted as UTF-8, NOT escaped; ``/`` is
              not escaped.
  * Integers: decimal, no leading zeros (Python ``str(int)`` / JS ``String``).
  * Booleans: ``true`` / ``false``.  Null: ``null``.
  * Floats:   REJECTED — monetary values must be passed as fixed scale-8
              decimal strings (e.g. ``"0.00041850"``), never floats.
  * Output:   UTF-8 bytes.
"""

from __future__ import annotations

import hashlib
from typing import Any

# A genesis (first) record points at this all-zero previous hash.
GENESIS_PREV_HASH = "0" * 64

# Derived / sealing fields are never part of the hashed body.
_SEALED_FIELDS = frozenset({"recordHash", "signature", "signingKeyId"})

_ESCAPES = {
    '"': '\\"',
    "\\": "\\\\",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
}


def _escape_string(s: str) -> str:
    out = ['"']
    for ch in s:
        esc = _ESCAPES.get(ch)
        if esc is not None:
            out.append(esc)
        elif ord(ch) < 0x20:
            out.append("\\u%04x" % ord(ch))
        else:
            out.append(ch)
    out.append('"')
    return "".join(out)


def _canon(value: Any) -> str:
    # bool must be checked before int (bool is a subclass of int in Python).
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, bool):  # pragma: no cover - covered by the literals above
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        raise TypeError(
            "floats are not allowed in canonical ledger serialization; "
            "pass monetary values as fixed scale-8 strings"
        )
    if isinstance(value, str):
        return _escape_string(value)
    if isinstance(value, (list, tuple)):
        return "[" + ",".join(_canon(v) for v in value) + "]"
    if isinstance(value, dict):
        keys = sorted(value.keys())
        parts = []
        for k in keys:
            if not isinstance(k, str):
                raise TypeError("object keys must be strings")
            if not k.isascii():
                raise ValueError("object keys must be ASCII for cross-language determinism")
            parts.append(_escape_string(k) + ":" + _canon(value[k]))
        return "{" + ",".join(parts) + "}"
    raise TypeError(f"unsupported type in canonical serialization: {type(value)!r}")


def canonicalize(value: Any) -> bytes:
    """Return the canonical UTF-8 bytes for ``value``."""
    return _canon(value).encode("utf-8")


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def record_body(record: dict) -> dict:
    """Return the hashed body of a record: every field except the sealing fields
    (recordHash / signature / signingKeyId)."""
    return {k: v for k, v in record.items() if k not in _SEALED_FIELDS}


def compute_record_hash(record: dict) -> str:
    """SHA-256 (hex) of the canonical serialization of the record body.

    The body MUST already contain ``sequence`` and ``prevHash`` — those are what
    chain each record to its predecessor and make the ledger tamper-evident.
    """
    return sha256_hex(canonicalize(record_body(record)))
