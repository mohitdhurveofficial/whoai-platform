/**
 * Canonical serialization + hashing for the WHOAI enforcement ledger.
 *
 * Byte-exact mirror of runtime/ledger/canonical.py. A record hashed and signed
 * by the Python gateway must verify identically here (reference verifier +
 * public /verify endpoint). Any change here MUST be mirrored in the Python
 * module and the golden vectors (lib/ledger/golden-vectors.json) regenerated
 * via `.venv/bin/python scripts/gen_ledger_golden.py`.
 *
 * Canonical rules (strict JCS-style subset):
 *  - Objects:  ASCII keys only, sorted by code point, no whitespace.
 *  - Strings:  escape " \ and C0 controls (\b \f \n \r \t), other < 0x20 as
 *              \u00xx (lowercase); non-ASCII emitted as UTF-8 (not escaped).
 *  - Integers: decimal. Floats are REJECTED (use fixed scale-8 strings).
 *  - Output:   UTF-8 bytes.
 */
import { createHash } from "node:crypto";

/** A genesis (first) record points at this all-zero previous hash. */
export const GENESIS_PREV_HASH = "0".repeat(64);

const SEALED_FIELDS = new Set(["recordHash", "signature", "signingKeyId"]);

const SIMPLE_ESCAPES: Record<string, string> = {
  '"': '\\"',
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
};

function escapeString(s: string): string {
  let out = '"';
  for (const ch of s) {
    const simple = SIMPLE_ESCAPES[ch];
    if (simple !== undefined) {
      out += simple;
    } else if ((ch.codePointAt(0) as number) < 0x20) {
      out += "\\u" + (ch.codePointAt(0) as number).toString(16).padStart(4, "0");
    } else {
      out += ch;
    }
  }
  return out + '"';
}

function canon(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  const t = typeof value;
  if (t === "number") {
    if (!Number.isInteger(value as number)) {
      throw new Error(
        "floats are not allowed in canonical ledger serialization; pass monetary values as fixed scale-8 strings",
      );
    }
    return String(value);
  }
  if (t === "bigint") return (value as bigint).toString();
  if (t === "string") return escapeString(value as string);
  if (Array.isArray(value)) return "[" + value.map(canon).join(",") + "]";
  if (t === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const parts: string[] = [];
    for (const k of keys) {
      // eslint-disable-next-line no-control-regex
      if (!/^[\x00-\x7F]*$/.test(k)) {
        throw new Error("object keys must be ASCII for cross-language determinism");
      }
      parts.push(escapeString(k) + ":" + canon(obj[k]));
    }
    return "{" + parts.join(",") + "}";
  }
  throw new Error("unsupported type in canonical serialization: " + t);
}

/** Return the canonical UTF-8 bytes for `value`. */
export function canonicalize(value: unknown): Buffer {
  return Buffer.from(canon(value), "utf8");
}

export function sha256Hex(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** Strip the sealing fields (recordHash / signature / signingKeyId). */
export function recordBody(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(record)) {
    if (!SEALED_FIELDS.has(k)) out[k] = record[k];
  }
  return out;
}

/**
 * SHA-256 (hex) of the canonical serialization of the record body. The body
 * MUST contain `sequence` and `prevHash` — those chain each record.
 */
export function computeRecordHash(record: Record<string, unknown>): string {
  return sha256Hex(canonicalize(recordBody(record)));
}
