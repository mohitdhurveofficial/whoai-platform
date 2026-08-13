import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/guard";

export async function POST(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  // Pausing or resuming an entire organization halts every agent's traffic, so
  // it is gated on manageOrganization rather than mere membership. The previous
  // check read organizationId from Supabase user_metadata, which is mirrored at
  // signup and can go stale; guard.auth.organizationId comes from the database.
  const guard = await requirePermission("manageOrganization");
  if (!guard.ok) return guard.response;
  const params = await context.params;

  if (guard.auth.organizationId !== params.id) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = body.reason || "MANUAL_RESUME";

  try {
    const metadata = { reason, actorId: guard.auth.userId };
    const organization = await prisma.$transaction(async (tx) => {
      const resumed = await tx.organization.update({
        where: { id: params.id },
        data: {
          status: "ACTIVE",
          pausedAt: null,
          pauseReason: null,
        },
      });

      await tx.alert.create({
        data: {
          organizationId: params.id,
          type: "ORG_RESUMED",
          severity: "HIGH",
          title: "Organization resumed",
          message: "Organization resumed.",
          metadata,
        },
      });
      await tx.activityLog.create({
        data: {
          organizationId: params.id,
          action: "ORG_RESUMED",
          status: "SUCCESS",
          metadata,
        },
      });

      return resumed;
    });

    return NextResponse.json({ success: true, organization });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
