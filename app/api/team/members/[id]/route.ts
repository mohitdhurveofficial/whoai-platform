import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/guard";
import { isRole, normalizeRole, outranks } from "@/lib/auth/roles";

/**
 * Change a member's role, or remove them from the workspace.
 *
 * Two invariants are enforced on every mutation here:
 *
 *  1. You may not act on someone at or above your own rank. Without this, an
 *     ADMIN could demote the OWNER and take the workspace.
 *  2. The last OWNER can never be demoted or removed. A workspace with no owner
 *     has no one who can manage billing or recover it.
 */

async function loadTarget(organizationId: string, id: string) {
  return prisma.user.findFirst({
    where: { id, organizationId },
    select: { id: true, email: true, fullName: true, role: true },
  });
}

/** True when removing/demoting this member would leave the org ownerless. */
async function isLastOwner(organizationId: string, targetRole: string): Promise<boolean> {
  if (normalizeRole(targetRole) !== "OWNER") return false;
  const owners = await prisma.user.count({ where: { organizationId, role: "OWNER" } });
  return owners <= 1;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("manageMemberRoles");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const nextRole = typeof body.role === "string" ? body.role.toUpperCase() : "";

  if (!isRole(nextRole)) {
    return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  }

  const target = await loadTarget(guard.auth.organizationId, id);
  if (!target) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  if (target.id === guard.auth.userId) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
  }

  // Equal rank is not enough — an OWNER must not be able to demote another
  // OWNER out from under them.
  if (!outranks(guard.auth.role, target.role)) {
    return NextResponse.json(
      { error: "You cannot change the role of someone at or above your own." },
      { status: 403 },
    );
  }

  if (await isLastOwner(guard.auth.organizationId, target.role)) {
    return NextResponse.json(
      { error: "This is the last owner. Promote someone else to owner first." },
      { status: 409 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { role: nextRole },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: guard.auth.organizationId,
      action: "MEMBER_ROLE_CHANGED",
      status: "SUCCESS",
      metadata: {
        memberId: target.id,
        from: normalizeRole(target.role),
        to: nextRole,
        actorId: guard.auth.userId,
      },
    },
  });

  return NextResponse.json({ ...updated, role: normalizeRole(updated.role) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("manageInvites");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const target = await loadTarget(guard.auth.organizationId, id);
  if (!target) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  if (target.id === guard.auth.userId) {
    return NextResponse.json(
      { error: "You cannot remove yourself. Ask another owner to do it." },
      { status: 400 },
    );
  }

  if (!outranks(guard.auth.role, target.role)) {
    return NextResponse.json(
      { error: "You cannot remove someone at or above your own role." },
      { status: 403 },
    );
  }

  if (await isLastOwner(guard.auth.organizationId, target.role)) {
    return NextResponse.json(
      { error: "This is the last owner and cannot be removed." },
      { status: 409 },
    );
  }

  await prisma.user.delete({ where: { id: target.id } });

  await prisma.activityLog.create({
    data: {
      organizationId: guard.auth.organizationId,
      action: "MEMBER_REMOVED",
      status: "SUCCESS",
      metadata: { memberEmail: target.email, actorId: guard.auth.userId },
    },
  });

  return NextResponse.json({ success: true });
}
