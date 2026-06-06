import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export type ServerAuthContext = {
  userId?: string;
  organizationId: string;
};

export async function getServerAuthContext(): Promise<ServerAuthContext | null> {
  console.log("AUTH CHECK START");

  const jwtSession = await getAuthSession().catch(() => null);

  console.log("JWT SESSION:", jwtSession);

  if (jwtSession?.organizationId) {
    const user = await prisma.user.findFirst({
      where: {
        id: jwtSession.userId,
        organizationId: jwtSession.organizationId,
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    console.log("JWT USER:", user);

    if (user) {
      return {
        userId: user.id,
        organizationId: user.organizationId,
      };
    }
  }

  const supabase = await createClient().catch(() => null);

  if (!supabase) {
    console.log("SUPABASE CLIENT NULL");
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("SUPABASE USER:", user?.email);

  if (!user?.id) return null;

  const appUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: user.id },
        ...(user.email ? [{ email: user.email }] : []),
      ],
    },
    select: {
      id: true,
      organizationId: true,
    },
  });

  console.log("APP USER:", appUser);

  if (!appUser) return null;

  return {
    userId: appUser.id,
    organizationId: appUser.organizationId,
  };
}