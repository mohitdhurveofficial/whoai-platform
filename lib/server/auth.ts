import { getAuthSession } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export type ServerAuthContext = {
  userId?: string;
  organizationId: string;
};

export async function getServerAuthContext(): Promise<ServerAuthContext | null> {
  const jwtSession = await getAuthSession().catch(() => null);
  if (jwtSession?.organizationId) {
    return jwtSession;
  }

  const supabase = await createClient().catch(() => null);
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const organizationId = user?.user_metadata?.organizationId;
  if (!organizationId || typeof organizationId !== "string") return null;

  return {
    userId: user.id,
    organizationId,
  };
}
