import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { encrypt } from "@/lib/encryption";

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
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, providers });
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

    const validProviders = ["openai", "anthropic", "gemini", "grok", "deepseek"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const encryptedApiKey = encrypt(apiKey);

    const credential = await prisma.providerCredential.upsert({
      where: {
        organizationId_provider: {
          organizationId: auth.organizationId,
          provider,
        },
      },
      update: {
        encryptedApiKey,
        status: "CONNECTED",
      },
      create: {
        organizationId: auth.organizationId,
        provider,
        encryptedApiKey,
        status: "CONNECTED",
      },
    });

    return NextResponse.json({
      success: true,
      provider: {
        id: credential.id,
        provider: credential.provider,
        status: credential.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
