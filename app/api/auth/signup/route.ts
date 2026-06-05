import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrgTier } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return `${base || "workspace"}-${crypto.randomUUID().slice(0, 8)}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Signup failed";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      name?: string;
      email?: string;
      password?: string;
      organizationName?: string;
    };

    const fullName = (body.fullName ?? body.name ?? "").trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const organizationName = body.organizationName?.trim();

    if (!fullName || !email || !password || !organizationName) {
      return NextResponse.json(
        { success: false, error: "Full name, email, password, and organization name are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const signup = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          organizationName,
          role: "OWNER",
        },
      },
    });

    if (signup.error || !signup.data.user) {
      return NextResponse.json(
        { success: false, error: signup.error?.message ?? "Could not create Supabase user" },
        { status: 400 },
      );
    }
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: slugify(organizationName),
        tier: OrgTier.STARTUP,
      },
    });

    const user = await prisma.user.create({
      data: {
        id: signup.data.user.id,
        fullName,
        email,
        role: "OWNER",
        organizationId: organization.id,
      },
    });

    await supabase.auth.updateUser({
      data: {
        organizationId: user.organizationId,
        role: user.role,
      },
    });

    const token = createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      redirectTo: "/dashboard",
    });

    response.cookies.set("whoai_auth", token, sessionCookieOptions);
    return response;
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}
