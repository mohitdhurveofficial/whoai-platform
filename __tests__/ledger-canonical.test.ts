import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  canonicalize,
  computeRecordHash,
  recordBody,
  GENESIS_PREV_HASH,
} from "@/lib/ledger/canonical";
import { signHash, verifyHash, publicRawFromSeed, keyId } from "@/lib/ledger/signing";

const vectors = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "lib/ledger/golden-vectors.json"), "utf8"),
) as {
  canonical: { name: string; record: Record<string, unknown>; canonical: string; recordHash: string }[];
  signing: {
    seedHex: string;
    publicKeyRawHex: string;
    keyId: string;
    recordHashHex: string;
    signatureHex: string;
  };
};

describe("ledger canonical serialization (TS ↔ Python golden vectors)", () => {
  it("genesis prev-hash constant matches", () => {
    expect(GENESIS_PREV_HASH).toBe("0".repeat(64));
  });

  for (const v of vectors.canonical) {
    it(`canonical bytes + record hash match for "${v.name}"`, () => {
      expect(canonicalize(recordBody(v.record)).toString("utf8")).toBe(v.canonical);
      expect(computeRecordHash(v.record)).toBe(v.recordHash);
    });
  }

  it("rejects floats (forces scale-8 strings)", () => {
    expect(() => canonicalize({ cost: 0.1 })).toThrow();
  });
});

describe("ledger Ed25519 signing (cross-language determinism)", () => {
  const s = vectors.signing;
  const seed = Buffer.from(s.seedHex, "hex");

  it("derives the same public key + keyId as Python", () => {
    expect(publicRawFromSeed(seed).toString("hex")).toBe(s.publicKeyRawHex);
    expect(keyId(Buffer.from(s.publicKeyRawHex, "hex"))).toBe(s.keyId);
  });

  it("produces the same deterministic signature as Python", () => {
    expect(signHash(seed, s.recordHashHex)).toBe(s.signatureHex);
  });

  it("verifies a valid signature and rejects tampering", () => {
    const pub = Buffer.from(s.publicKeyRawHex, "hex");
    expect(verifyHash(pub, s.recordHashHex, s.signatureHex)).toBe(true);
    const tampered = s.recordHashHex.slice(0, -1) + (s.recordHashHex.endsWith("0") ? "1" : "0");
    expect(verifyHash(pub, tampered, s.signatureHex)).toBe(false);
  });
});
