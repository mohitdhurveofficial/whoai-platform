import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { generateApiKey } from "@/lib/security/api-keys";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const auth = await getServerAuthContext();

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { plainText, hash } = generateApiKey();

    const apiKey = await prisma["apiKey"].create({
      data: {
        id: crypto.randomUUID(),
        organizationId: auth.organizationId,
        name: body.name || "Default Key",
        keyHash: hash,
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: plainText,
      id: apiKey.id,
      name: apiKey.name,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}