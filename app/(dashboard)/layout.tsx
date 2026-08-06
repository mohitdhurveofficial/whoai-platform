import type { Metadata } from "next";
import Sidebar from "../components/Sidebar";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { normalizeTier, planConfig } from "@/lib/subscription";

// The authenticated app should never be indexed by search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Resolve who is actually signed in and what they are actually paying for.
 *
 * Done here rather than fetched from the client because getServerAuthContext
 * handles both the JWT cookie and the Supabase session, whereas /api/auth/me
 * reads only the JWT — a Supabase-authenticated user would get a blank sidebar.
 * The sidebar previously hardcoded "Current User / Pro Plan", which contradicted
 * the billing page and the quota the gateway actually enforces.
 */
async function getIdentity() {
  const auth = await getServerAuthContext().catch(() => null);
  if (!auth) return null;

  const [user, organization] = await Promise.all([
    auth.userId
      ? prisma.user.findUnique({
          where: { id: auth.userId },
          select: { email: true, fullName: true },
        })
      : null,
    prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: { name: true, subscriptionTier: true },
    }),
  ]);

  const displayName = user?.fullName || user?.email?.split("@")[0] || "Account";

  return {
    displayName,
    email: user?.email ?? null,
    organizationName: organization?.name ?? null,
    planLabel: planConfig(normalizeTier(organization?.subscriptionTier)).label,
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getIdentity();

  return (
    <div className="texture min-h-screen text-[#111111] font-sans selection:bg-[#FF6B00] selection:text-white">
      <Sidebar identity={identity} />
      <main className="md:ml-[260px] min-h-screen pt-16 md:pt-0">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
