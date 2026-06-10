import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { encrypt } from "@/lib/encryption";
import { validateKeyFormat } from "@/lib/providers/key-format";

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const providers = await prisma.providerCredential.findMany({
      where: { organizationId: auth.organizationId },
      select: {
        id: true,
        provider: true,
        status: true,
        keyLast4: true,
        lastTestedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Never return the raw or encrypted key. Surface only a masked hint built
    // from the non-sensitive last 4 characters.
    const masked = providers.map((p) => ({
      ...p,
      maskedKey: p.keyLast4 ? `••••••••${p.keyLast4}` : null,
    }));

    return NextResponse.json({ success: true, providers: masked });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API Key are required" },
        { status: 400 }
      );
    }

    // Validate the key shape before doing anything else. On failure we return
    // the reason but never echo the key back.
    const format = validateKeyFormat(provider, apiKey);
    if (!format.ok) {
      return NextResponse.json({ error: format.reason }, { status: 400 });
    }

    const key = String(apiKey).trim();
    const encryptedApiKey = encrypt(key);
    const keyLast4 = key.slice(-4);

    const credential = await prisma.providerCredential.upsert({
      where: {
        organizationId_provider: {
          organizationId: auth.organizationId,
          provider,
        },
      },
      update: {
        encryptedApiKey,
        keyLast4,
        status: "CONNECTED",
        lastTestedAt: null,
      },
      create: {
        organizationId: auth.organizationId,
        provider,
        encryptedApiKey,
        keyLast4,
        status: "CONNECTED",
      },
    });

    return NextResponse.json({
      success: true,
      provider: {
        id: credential.id,
        provider: credential.provider,
        status: credential.status,
        maskedKey: `••••••••${credential.keyLast4}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
