import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrgTier } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { lookupInvite } from "@/lib/team/invites";
import { checkRateLimit, clientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/security/rate-limit";

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
    // Per-IP only: the account does not exist yet, so there is no second axis
    // to key on. Checked before any work so a bulk-registration script is
    // rejected before it reaches Supabase.
    const limited = await checkRateLimit(`signup:ip:${clientIp(request)}`, RATE_LIMITS.signup);
    if (!limited.allowed) {
      return rateLimitResponse(
        limited,
        "Too many accounts created from this network. Please try again later.",
      );
    }

    const body = (await request.json()) as {
      fullName?: string;
      name?: string;
      email?: string;
      password?: string;
      organizationName?: string;
      inviteToken?: string;
    };

    const fullName = (body.fullName ?? body.name ?? "").trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const organizationName = body.organizationName?.trim();
    const inviteToken = body.inviteToken?.trim();

    // Two paths through this route: founding a new workspace (organizationName
    // required) or accepting an invitation to an existing one (token required,
    // organizationName meaningless). Resolve which one before validating.
    const invitation = inviteToken ? await lookupInvite(inviteToken) : null;
    if (inviteToken && !invitation?.ok) {
      return NextResponse.json(
        { success: false, error: invitation && !invitation.ok ? invitation.error : "Invalid invitation." },
        { status: 400 },
      );
    }
    const invite = invitation?.ok ? invitation.invite : null;

    if (!fullName || !email || !password || (!invite && !organizationName)) {
      return NextResponse.json(
        {
          success: false,
          error: invite
            ? "Full name, email, and password are required"
            : "Full name, email, password, and organization name are required",
        },
        { status: 400 },
      );
    }

    // The invite is bound to one address. Letting a different email redeem it
    // would turn a forwarded email into an open door to the workspace.
    if (invite && invite.email !== email) {
      return NextResponse.json(
        { success: false, error: `This invitation was sent to ${invite.email}. Sign up with that address.` },
        { status: 403 },
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
          organizationName: invite ? invite.organizationName : organizationName,
          role: invite ? invite.role : "OWNER",
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
    // leave an orphaned organization behind. On the invite path there is no
    // organization to create — the user joins the inviter's.
    const user = await prisma.$transaction(async (tx) => {
      if (invite) {
        // Consume the invitation under a PENDING filter so two people racing
        // the same link produce exactly one member: the loser's updateMany
        // matches zero rows and the whole transaction rolls back.
        const consumed = await tx.invite.updateMany({
          where: { id: invite.id, status: "PENDING" },
          data: { status: "ACCEPTED", acceptedAt: new Date() },
        });
        if (consumed.count === 0) {
          throw new Error("INVITE_ALREADY_USED");
        }

        return tx.user.create({
          data: {
            id: supabaseUserId,
            fullName,
            email,
            role: invite.role,
            organizationId: invite.organizationId,
          },
        });
      }

      const organization = await tx.organization.create({
        data: {
          name: organizationName!,
          slug: slugify(organizationName!),
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

    if (error instanceof Error && error.message === "INVITE_ALREADY_USED") {
      return NextResponse.json(
        { success: false, error: "This invitation has already been used." },
        { status: 409 },
      );
    }

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
