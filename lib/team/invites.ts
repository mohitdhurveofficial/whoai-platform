import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/email";
import { reportError } from "@/lib/observability/report";
import { normalizeRole, type Role } from "@/lib/auth/roles";

/**
 * Invitation lifecycle for team membership.
 *
 * The raw token is generated here, emailed once, and never persisted — only its
 * SHA-256 hash is stored. A database leak therefore yields no usable join links.
 * Lookup is by hash so acceptance stays a single indexed query rather than a
 * scan-and-compare over every pending row.
 */

/** Long enough that guessing is infeasible; URL-safe so it survives an email client. */
const TOKEN_BYTES = 32;

export const INVITE_TTL_DAYS = 7;

const FROM_ADDRESS = "WHOAI <notifications@whoai.ai>";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function inviteUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/auth/accept-invite?token=${token}`;
}

/**
 * Constant-time comparison of two hex hashes.
 *
 * The lookup is already by unique hash, so this only guards the belt-and-braces
 * re-check; still worth doing in constant time so the re-check cannot become a
 * timing oracle if the lookup is ever loosened.
 */
export function tokenMatches(rawToken: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashToken(rawToken), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

export type CreateInviteResult =
  | { ok: true; invite: { id: string; email: string; role: Role; expiresAt: Date }; emailSent: boolean }
  | { ok: false; error: string; status: number };

/**
 * Create (or replace) a pending invite and email it.
 *
 * Re-inviting an address upserts rather than inserting, so the @@unique
 * [organizationId, email] constraint holds and an address never ends up with
 * several simultaneously-valid links.
 */
export async function createInvite(params: {
  organizationId: string;
  email: string;
  role: Role;
  invitedById?: string;
  organizationName: string;
}): Promise<CreateInviteResult> {
  const email = params.email.trim().toLowerCase();

  // Someone already in *any* organization cannot be invited: User.email is
  // globally unique and a user belongs to exactly one workspace.
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { organizationId: true },
  });
  if (existing) {
    return existing.organizationId === params.organizationId
      ? { ok: false, error: "That person is already a member of this workspace.", status: 409 }
      : { ok: false, error: "That email already belongs to another WHOAI workspace.", status: 409 };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.upsert({
    where: { organizationId_email: { organizationId: params.organizationId, email } },
    create: {
      organizationId: params.organizationId,
      email,
      role: params.role,
      tokenHash: hashToken(token),
      expiresAt,
      invitedById: params.invitedById,
    },
    update: {
      role: params.role,
      tokenHash: hashToken(token),
      status: "PENDING",
      expiresAt,
      acceptedAt: null,
      revokedAt: null,
      invitedById: params.invitedById,
    },
    select: { id: true, email: true, role: true, expiresAt: true },
  });

  // Delivery is best-effort: the invite row is the source of truth, and the
  // inviter can copy the link from the team page if the email bounces.
  let emailSent = false;
  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `You've been invited to ${params.organizationName} on WHOAI`,
      html: inviteEmailHtml({
        organizationName: params.organizationName,
        role: params.role,
        url: inviteUrl(token),
      }),
    });
    emailSent = true;
  } catch (error) {
    await reportError(error, {
      source: "team:invite-email",
      organizationId: params.organizationId,
      extra: { inviteId: invite.id },
    });
  }

  return {
    ok: true,
    invite: { ...invite, role: normalizeRole(invite.role) },
    emailSent,
  };
}

function inviteEmailHtml(params: { organizationName: string; role: Role; url: string }): string {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#111111">
    <div style="font-size:18px;font-weight:700;letter-spacing:-0.01em">WHOAI</div>
    <h1 style="font-size:22px;font-weight:700;margin:24px 0 8px">You've been invited to ${escapeHtml(params.organizationName)}</h1>
    <p style="font-size:15px;line-height:1.6;color:#444444;margin:0 0 24px">
      You'll join as a <strong>${escapeHtml(params.role)}</strong>. This link expires in ${INVITE_TTL_DAYS} days.
    </p>
    <a href="${params.url}" style="display:inline-block;background:#FF6B00;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:600">
      Accept invitation
    </a>
    <p style="font-size:13px;line-height:1.6;color:#888888;margin:24px 0 0">
      If the button doesn't work, paste this into your browser:<br />
      <span style="word-break:break-all">${params.url}</span>
    </p>
    <p style="font-size:13px;color:#888888;margin:24px 0 0">
      Didn't expect this? You can ignore this email — nothing happens until you accept.
    </p>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type InviteLookup =
  | { ok: true; invite: { id: string; email: string; role: Role; organizationId: string; organizationName: string } }
  | { ok: false; error: string };

/**
 * Resolve a raw token to a live invite.
 *
 * Every failure returns the same generic message: distinguishing "expired" from
 * "revoked" from "never existed" would let an attacker probe which tokens were
 * ever real.
 */
export async function lookupInvite(token: string): Promise<InviteLookup> {
  const invalid = { ok: false as const, error: "This invitation link is invalid or has expired." };
  if (!token) return invalid;

  const invite = await prisma.invite.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      tokenHash: true,
      organizationId: true,
      organization: { select: { name: true } },
    },
  });

  if (!invite) return invalid;
  if (!tokenMatches(token, invite.tokenHash)) return invalid;
  if (invite.status !== "PENDING") return invalid;
  if (invite.expiresAt.getTime() <= Date.now()) return invalid;

  return {
    ok: true,
    invite: {
      id: invite.id,
      email: invite.email,
      role: normalizeRole(invite.role),
      organizationId: invite.organizationId,
      organizationName: invite.organization.name,
    },
  };
}

/** Mark an invite consumed. Called inside the signup transaction. */
export async function markInviteAccepted(inviteId: string): Promise<void> {
  await prisma.invite.update({
    where: { id: inviteId },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });
}
