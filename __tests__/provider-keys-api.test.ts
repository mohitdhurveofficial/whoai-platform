import { describe, it, expect, vi, beforeEach } from "vitest";

const findMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { providerCredential: { findMany: (...a: unknown[]) => findMany(...a) } },
}));

vi.mock("@/lib/server/auth", () => ({
  getServerAuthContext: vi.fn().mockResolvedValue({ organizationId: "org-1", userId: "u1" }),
}));

import { GET } from "@/app/api/settings/providers/route";

beforeEach(() => {
  findMany.mockReset();
});

describe("GET /api/settings/providers", () => {
  it("masks keys with last-4 and never returns the encrypted key", async () => {
    findMany.mockResolvedValueOnce([
      {
        id: "c1",
        provider: "openai",
        status: "CONNECTED",
        keyLast4: "1234",
        lastTestedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(body.success).toBe(true);
    const p = body.providers[0];
    expect(p.maskedKey).toBe("••••••••1234");
    // Critical: raw/encrypted material must never leave the API.
    expect(p).not.toHaveProperty("encryptedApiKey");
    expect(JSON.stringify(body)).not.toContain("encryptedApiKey");

    // The DB query itself must not select the ciphertext column.
    const selectArg = findMany.mock.calls[0][0].select;
    expect(selectArg.encryptedApiKey).toBeUndefined();
  });

  it("returns null maskedKey when no last-4 is stored", async () => {
    findMany.mockResolvedValueOnce([
      { id: "c2", provider: "anthropic", status: "CONNECTED", keyLast4: null, lastTestedAt: null, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const res = await GET();
    const body = await res.json();
    expect(body.providers[0].maskedKey).toBeNull();
  });
});
