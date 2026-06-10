import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { decrypt } from "@/lib/encryption";
import { getAdapter } from "@/lib/gateway/adapters";
import { isSupportedProvider } from "@/lib/providers/key-format";

// POST /api/settings/providers/:provider/test
// Runs a live, low-cost auth check against the stored credential and records
// the result. Never returns or logs the key.
export async function POST(
  _req: Request,
  context: { params: { provider: string } | Promise<{ provider: string }> },
) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider } = await context.params;

  if (!isSupportedProvider(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  try {
    const credential = await prisma.providerCredential.findUnique({
      where: {
        organizationId_provider: {
          organizationId: auth.organizationId,
          provider,
        },
      },
    });

    if (!credential) {
      return NextResponse.json(
        { error: `No ${provider} key is configured` },
        { status: 404 },
      );
    }

    let apiKey: string;
    try {
      apiKey = decrypt(credential.encryptedApiKey);
    } catch {
      // Stored ciphertext is unreadable (e.g. ENCRYPTION_KEY rotated). Mark it
      // disconnected so the UI prompts the customer to re-enter the key.
      await prisma.providerCredential.update({
        where: { id: credential.id },
        data: { status: "DISCONNECTED", lastTestedAt: new Date() },
      });
      return NextResponse.json(
        { ok: false, status: "DISCONNECTED", error: "Stored key could not be read; please re-enter it." },
        { status: 200 },
      );
    }

    const result = await getAdapter(provider).validateKey(apiKey);
    const status = result.ok ? "CONNECTED" : "DISCONNECTED";

    await prisma.providerCredential.update({
      where: { id: credential.id },
      data: { status, lastTestedAt: new Date() },
    });

    return NextResponse.json({ ok: result.ok, status, detail: result.detail ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
