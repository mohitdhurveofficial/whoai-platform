import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists in our system
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      },
    );

    if (error) {
      console.error("Supabase password reset error:", error);
      // Still return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reset email" },
      { status: 500 },
    );
  }
}
