import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = user?.user_metadata?.organizationId;
  const params = await context.params;

  if (!orgId || orgId !== params.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = body.reason || "MANUAL_RESUME";

  try {
    const metadata = { reason, actorId: user?.id };
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
