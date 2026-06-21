/**
 * Ed25519 signing for ledger records. Byte-exact mirror of
 * runtime/ledger/signing.py.
 *
 * Signatures are over the record-hash hex string's ASCII bytes. Ed25519 is
 * deterministic (RFC 8032), so the same seed + message yields the same
 * signature here and in Python — enabling cross-language golden vectors.
 *
 * Node has no raw-Ed25519 key import, so we wrap the 32-byte seed / raw public
 * key in the fixed PKCS#8 / SPKI DER prefixes for Ed25519.
 */
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign as edSign,
  verify as edVerify,
  type KeyObject,
} from "node:crypto";

// DER prefixes for an Ed25519 PKCS#8 private key and SPKI public key.
const PKCS8_ED25519_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");
const SPKI_ED25519_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export function generateSeed(): Buffer {
  return randomBytes(32);
}

function privateFromSeed(seed: Buffer): KeyObject {
  if (seed.length !== 32) throw new Error("Ed25519 seed must be 32 bytes");
  return createPrivateKey({
    key: Buffer.concat([PKCS8_ED25519_PREFIX, seed]),
    format: "der",
    type: "pkcs8",
  });
}

function publicFromRaw(raw: Buffer): KeyObject {
  if (raw.length !== 32) throw new Error("Ed25519 public key must be 32 bytes");
  return createPublicKey({
    key: Buffer.concat([SPKI_ED25519_PREFIX, raw]),
    format: "der",
    type: "spki",
  });
}

/** Return the 32-byte raw public key for a private seed. */
export function publicRawFromSeed(seed: Buffer): Buffer {
  const der = createPublicKey(privateFromSeed(seed)).export({
    format: "der",
    type: "spki",
  }) as Buffer;
  return der.subarray(der.length - 32);
}

/** Sign a record hash (hex) and return the signature as hex. */
export function signHash(seed: Buffer, recordHashHex: string): string {
  return edSign(null, Buffer.from(recordHashHex, "ascii"), privateFromSeed(seed)).toString("hex");
}

/** Verify a hex signature over a record hash with a 32-byte raw public key. */
export function verifyHash(publicRaw: Buffer, recordHashHex: string, signatureHex: string): boolean {
  return edVerify(
    null,
    Buffer.from(recordHashHex, "ascii"),
    publicFromRaw(publicRaw),
    Buffer.from(signatureHex, "hex"),
  );
}

/** Stable, short identifier for a signing key (goes in `signingKeyId`). */
export function keyId(publicRaw: Buffer): string {
  return "ed25519-" + createHash("sha256").update(publicRaw).digest("hex").slice(0, 16);
}
