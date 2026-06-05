import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Login failed";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const authResult = await supabase.auth.signInWithPassword({ email, password });

    if (authResult.error || !authResult.data.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error?.message ?? "Invalid credentials",
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: authResult.data.user.id }, { email }],
      },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No WHOAI organization membership found" },
        { status: 403 },
      );
    }

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization,
      },
      redirectTo: "/dashboard",
    });

    response.cookies.set("whoai_auth", token, sessionCookieOptions);
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500 },
    );
  }
}
