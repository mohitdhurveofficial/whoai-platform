import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      organizationName?: string;
    };

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const organizationName =
      typeof body.organizationName === "string" && body.organizationName.trim()
        ? body.organizationName.trim()
        : `${email.split("@")[0]}'s Organization`;

    const organizationSlug = `${organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${crypto.randomUUID().slice(0, 8)}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "OWNER",
        organization: {
          create: {
            name: organizationName,
            slug: organizationSlug,
          },    
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
  console.error("SIGNUP ERROR:", error);

  return NextResponse.json(
    {
      error: String(error),
      stack:
        process.env.NODE_ENV !== "production"
          ? (error as Error)?.stack
          : undefined,
    },
    { status: 500 }
  );
}
}