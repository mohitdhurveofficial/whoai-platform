import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/guard";

/**
 * Revoke a pending invitation.
 *
 * The row is marked REVOKED rather than deleted so the audit trail survives and
 * so lookupInvite's status check kills the emailed link immediately.
 */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("manageInvites");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  // Scoped by organizationId as well as id: without it, any admin could revoke
  // another workspace's invite by guessing a UUID.
  const invite = await prisma.invite.findFirst({
    where: { id, organizationId: guard.auth.organizationId },
    select: { id: true, email: true, status: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }
  if (invite.status !== "PENDING") {
    return NextResponse.json({ error: "That invitation is no longer pending." }, { status: 409 });
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: "REVOKED", revokedAt: new Date() },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: guard.auth.organizationId,
      action: "INVITE_REVOKED",
      status: "SUCCESS",
      metadata: { email: invite.email, actorId: guard.auth.userId },
    },
  });

  return NextResponse.json({ success: true });
}
