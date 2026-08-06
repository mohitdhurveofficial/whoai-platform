import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { generateApiKey } from "@/lib/security/api-keys";
import crypto from "crypto";

// Keys are stored as a SHA-256 hash and nothing else, so a key's plaintext
// exists exactly once — in the POST response. The list endpoint therefore
// returns metadata only; there is deliberately no "token preview" field,
// because reconstructing one would mean storing part of the secret.

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = await prisma.apiKey.findMany({
      where: { organizationId: auth.organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        revoked: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(keys);
  } catch (error) {
    console.error("API key list error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load API keys" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";

    const { plainText, hash } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: auth.organizationId,
        name: name || "Default Key",
        keyHash: hash,
      },
      select: { id: true, name: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      // The only time this value is ever available. The client must surface it
      // immediately — it cannot be recovered from the stored hash.
      apiKey: plainText,
      id: apiKey.id,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
    });
  } catch (error) {
    console.error("API key create error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    // Revoke rather than delete: the row is the audit trail for a key that may
    // have been used. Scoped by organizationId so an id from another tenant
    // matches nothing instead of revoking their key.
    const result = await prisma.apiKey.updateMany({
      where: { id, organizationId: auth.organizationId },
      data: { revoked: true },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API key revoke error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}
