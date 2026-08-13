import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit, clientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/security/rate-limit";

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

    // Every accepted request mails somebody who did not ask for it, so the
    // per-address limit matters as much as the per-IP one: it caps how often a
    // single victim can be spammed no matter how the requests are distributed.
    for (const key of [
      `pwreset:ip:${clientIp(request)}`,
      `pwreset:email:${normalizedEmail}`,
    ]) {
      const limited = await checkRateLimit(key, RATE_LIMITS.passwordReset);
      if (!limited.allowed) {
        // The counter increments before the account lookup, so a 429 is
        // reached identically for a real and an unknown address — this stays
        // consistent with the route's no-enumeration guarantee.
        return rateLimitResponse(
          limited,
          "Too many password reset requests. Please try again later.",
        );
      }
    }

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
    // NEXT_PUBLIC_APP_URL must be set in production so the reset link resolves
    // to a real origin. The "/auth/reset-password" page is provided separately.
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
