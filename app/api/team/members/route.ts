import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/guard";
import { normalizeRole } from "@/lib/auth/roles";

/** List everyone in the caller's workspace. Readable by every member. */
export async function GET() {
  const guard = await requirePermission("viewTeam");
  if (!guard.ok) return guard.response;

  const members = await prisma.user.findMany({
    where: { organizationId: guard.auth.organizationId },
    // Owners first, then admins, then by join date, so the list reads as a
    // hierarchy rather than an arbitrary ordering.
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });

  return NextResponse.json(
    members.map((member) => ({
      ...member,
      role: normalizeRole(member.role),
      isYou: member.id === guard.auth.userId,
    })),
  );
}
