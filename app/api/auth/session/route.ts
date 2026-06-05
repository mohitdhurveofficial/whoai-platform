import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

export async function GET() {
  const auth = await getServerAuthContext();
  if (!auth) return NextResponse.json({ authenticated: false }, { status: 401 });

  const user = await prisma.user.findFirst({
    where: {
      id: auth.userId,
      organizationId: auth.organizationId,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          status: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({ authenticated: true, user });
}
