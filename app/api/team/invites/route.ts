import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/guard";
import { isRole, normalizeRole, outranks, type Role } from "@/lib/auth/roles";
import { createInvite } from "@/lib/team/invites";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/security/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Pending invitations for the caller's workspace. */
export async function GET() {
  const guard = await requirePermission("viewTeam");
  if (!guard.ok) return guard.response;

  const invites = await prisma.invite.findMany({
    where: { organizationId: guard.auth.organizationId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
  });

  const now = Date.now();
  return NextResponse.json(
    invites.map((invite) => ({
      ...invite,
      role: normalizeRole(invite.role),
      // Expiry is surfaced rather than filtered out, so an admin can see why a
      // colleague's link stopped working and re-send it.
      expired: invite.expiresAt.getTime() <= now,
    })),
  );
}

/** Invite someone by email. Admin and above. */
export async function POST(request: Request) {
  const guard = await requirePermission("manageInvites");
  if (!guard.ok) return guard.response;

  // Keyed by workspace, not IP: this endpoint is authenticated, so the actor
  // worth bounding is the organization whose name appears on the outgoing
  // mail. Caps a compromised admin session's use of us as a mail relay.
  const limited = await checkRateLimit(
    `invite:org:${guard.auth.organizationId}`,
    RATE_LIMITS.invite,
  );
  if (!limited.allowed) {
    return rateLimitResponse(
      limited,
      "Too many invitations sent. Please try again in a little while.",
    );
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const rawRole = typeof body.role === "string" ? body.role.toUpperCase() : "DEVELOPER";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!isRole(rawRole)) {
    return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  }
  const role = rawRole as Role;

  // An ADMIN must not be able to mint an OWNER and escalate by proxy.
  if (!outranks(guard.auth.role, role)) {
    return NextResponse.json(
      { error: "You cannot invite someone at or above your own role." },
      { status: 403 },
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { id: guard.auth.organizationId },
    select: { name: true },
  });

  const result = await createInvite({
    organizationId: guard.auth.organizationId,
    email,
    role,
    invitedById: guard.auth.userId,
    organizationName: organization?.name ?? "your workspace",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await prisma.activityLog.create({
    data: {
      organizationId: guard.auth.organizationId,
      action: "MEMBER_INVITED",
      status: "SUCCESS",
      metadata: { email, role, actorId: guard.auth.userId },
    },
  });

  return NextResponse.json(
    {
      invite: result.invite,
      // Told plainly so the UI can prompt the admin to share the link manually
      // when Resend is unconfigured or the send bounced.
      emailSent: result.emailSent,
    },
    { status: 201 },
  );
}
