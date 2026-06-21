"""Regenerate lib/ledger/golden-vectors.json from the Python ledger primitives.

These vectors are the cross-language contract: the TS mirror (lib/ledger/*) and
the Python primitives (runtime/ledger/*) must both reproduce every canonical
string, record hash, and signature here. Run after any change to canonical.py /
canonical.ts:

    .venv/bin/python scripts/gen_ledger_golden.py
"""

import json
from pathlib import Path

from runtime.ledger import (
    canonicalize,
    compute_record_hash,
    key_id,
    public_raw_from_seed,
    sign_hash,
)
from runtime.ledger.canonical import GENESIS_PREV_HASH

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "lib" / "ledger" / "golden-vectors.json"

# Representative records + deliberate edge cases (escaping, unicode, nulls).
RECORDS = [
    {
        "name": "genesis_allowed",
        "record": {
            "schemaVersion": 1,
            "sequence": 0,
            "prevHash": GENESIS_PREV_HASH,
            "organizationId": "org_genesis",
            "agentId": "agent_001",
            "actorAuthorizer": None,
            "policyId": "IMPLICIT_BUDGET_KILLSWITCH_v1",
            "verdict": "ALLOWED",
            "provider": "openai",
            "model": "gpt-5.5",
            "currency": "USD",
            "estimatedCost": "0.00042100",
            "cost": "0.00041850",
            "timestamp": "2026-06-19T12:34:56.789Z",
            "enforcedBeforeCall": True,
            "enforcementProof": {
                "killSwitch": "INACTIVE",
                "preReserveRows": 1,
                "budgetRemaining": "12.50000000",
            },
        },
    },
    {
        "name": "blocked_no_cost",
        "record": {
            "schemaVersion": 1,
            "sequence": 1,
            "prevHash": "a" * 64,
            "organizationId": "org_genesis",
            "agentId": "agent_001",
            "actorAuthorizer": "user_admin_7",
            "policyId": "IMPLICIT_BUDGET_KILLSWITCH_v1",
            "verdict": "BLOCKED",
            "provider": "anthropic",
            "model": "claude-opus-4-8",
            "currency": "USD",
            "estimatedCost": "0.01250000",
            "cost": None,
            "timestamp": "2026-06-19T12:35:01.000Z",
            "enforcedBeforeCall": True,
            "enforcementProof": {
                "killSwitch": "ACTIVE",
                "preReserveRows": 0,
                "budgetRemaining": "0.00000000",
            },
        },
    },
    {
        "name": "rerouted_caller_fallback",
        "record": {
            "schemaVersion": 1,
            "sequence": 2,
            "prevHash": "b" * 64,
            "organizationId": "org_genesis",
            "agentId": "agent_002",
            "actorAuthorizer": None,
            "policyId": "IMPLICIT_BUDGET_KILLSWITCH_v1",
            "verdict": "REROUTED",
            "provider": "gemini",
            "model": "gemini-3.5-flash",
            "currency": "USD",
            "estimatedCost": "0.00010000",
            "cost": "0.00009500",
            "timestamp": "2026-06-19T12:35:09.250Z",
            "enforcedBeforeCall": True,
            "enforcementProof": {
                "killSwitch": "INACTIVE",
                "preReserveRows": 1,
                "callerInfluencedReroute": True,
                "fallbackProvider": "gemini",
            },
        },
    },
    {
        # Escaping + UTF-8 torture test: quotes, backslash, control chars, non-ASCII.
        "name": "escaping_unicode",
        "record": {
            "schemaVersion": 1,
            "sequence": 3,
            "prevHash": "c" * 64,
            "organizationId": "org_\"quote\"_\\slash",
            "agentId": "agent_\tTAB_\nNL",
            "actorAuthorizer": "café_漢字_😀",
            "policyId": "IMPLICIT_BUDGET_KILLSWITCH_v1",
            "verdict": "CAPPED",
            "provider": "deepseek",
            "model": "deepseek-v4",
            "currency": "USD",
            "estimatedCost": "1.00000000",
            "cost": "0.99999999",
            "timestamp": "2026-06-19T12:35:30.001Z",
            "enforcedBeforeCall": True,
            "enforcementProof": {"note": "unitseparator", "ok": False},
        },
    },
]

canonical_vectors = []
for item in RECORDS:
    rec = item["record"]
    canonical_vectors.append(
        {
            "name": item["name"],
            "record": rec,
            "canonical": canonicalize(
                {k: v for k, v in rec.items() if k not in ("recordHash", "signature", "signingKeyId")}
            ).decode("utf-8"),
            "recordHash": compute_record_hash(rec),
        }
    )

# Deterministic signing vector: fixed seed 00 01 02 ... 1f.
seed = bytes(range(32))
sign_message = canonical_vectors[0]["recordHash"]
signing_vector = {
    "seedHex": seed.hex(),
    "publicKeyRawHex": public_raw_from_seed(seed).hex(),
    "keyId": key_id(public_raw_from_seed(seed)),
    "recordHashHex": sign_message,
    "signatureHex": sign_hash(seed, sign_message),
}

payload = {
    "_comment": "Cross-language ledger golden vectors. Regenerate with .venv/bin/python scripts/gen_ledger_golden.py — do not hand-edit.",
    "canonical": canonical_vectors,
    "signing": signing_vector,
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {OUT}")
print(f"canonical vectors: {len(canonical_vectors)} | signing keyId: {signing_vector['keyId']}")
