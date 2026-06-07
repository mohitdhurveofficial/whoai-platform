import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

export async function DELETE(
  req: Request,
  context: { params: { provider: string } | Promise<{ provider: string }> }
) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const { provider } = params;

    await prisma.providerCredential.delete({
      where: {
        organizationId_provider: {
          organizationId: auth.organizationId,
          provider,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') { // Record to delete does not exist
       return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
