import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export type ServerAuthContext = {
  userId?: string;
  organizationId: string;
};

export async function getServerAuthContext(): Promise<ServerAuthContext | null> {
  const jwtSession = await getAuthSession().catch(() => null);

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

    if (user) {
      return {
        userId: user.id,
        organizationId: user.organizationId,
      };
    }
  }

  const supabase = await createClient().catch(() => null);

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  if (!appUser) return null;

  return {
    userId: appUser.id,
    organizationId: appUser.organizationId,
  };
}
