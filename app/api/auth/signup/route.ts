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
      const raw = signup.error?.message ?? "";
      const alreadyExists = /already registered|already exists/i.test(raw);
      return NextResponse.json(
        {
          success: false,
          error: alreadyExists
            ? "An account with this email already exists. Please sign in instead."
            : raw || "Could not create account",
        },
        { status: alreadyExists ? 409 : 400 },
      );
    }

    // When Supabase email-enumeration protection is enabled, signing up with an
    // already-registered email returns a user with an empty `identities` array
    // instead of an error. Treat that as a duplicate so we never create a second
    // organization for the same person.
    const supabaseUserId = signup.data.user.id;
    if (
      Array.isArray(signup.data.user.identities) &&
      signup.data.user.identities.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in instead." },
        { status: 409 },
      );
    }

    // Defensive: an app user may already exist even if Supabase accepted the call.
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in instead." },
        { status: 409 },
      );
    }

    // Create the organization and user atomically so a failure midway cannot
    // leave an orphaned organization behind.
    const user = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: slugify(organizationName),
          tier: OrgTier.STARTUP,
        },
      });

      return tx.user.create({
        data: {
          id: supabaseUserId,
          fullName,
          email,
          role: "OWNER",
          organizationId: organization.id,
        },
      });
    });

    // Mirror org/role onto the Supabase user metadata. Non-fatal if it fails.
    await supabase.auth
      .updateUser({ data: { organizationId: user.organizationId, role: user.role } })
      .catch(() => {});

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
    console.error("SIGNUP ERROR:", errorMessage(error));

    // Unique-constraint violation (e.g. email/slug race) → duplicate account.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in instead." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Signup failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
