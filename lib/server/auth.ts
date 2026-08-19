import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeRole, type Role } from "@/lib/auth/roles";
import { createClient } from "@/utils/supabase/server";

export type ServerAuthContext = {
  userId?: string;
  organizationId: string;
  /**
   * Read from the database on every call rather than from the session JWT, so
   * demoting a member takes effect immediately instead of when their token
   * happens to expire.
   */
  role: Role;
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
        role: true,
      },
    });

    if (user) {
      return {
        userId: user.id,
        organizationId: user.organizationId,
        role: normalizeRole(user.role),
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
      role: true,
    },
  });

  if (!appUser) return null;

  return {
    userId: appUser.id,
    organizationId: appUser.organizationId,
    role: normalizeRole(appUser.role),
  };
}
