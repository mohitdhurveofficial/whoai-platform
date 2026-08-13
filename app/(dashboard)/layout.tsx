import type { Metadata } from "next";
import Sidebar, { type SidebarUser } from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { normalizeTier, planConfig } from "@/lib/subscription";

// The authenticated app should never be indexed by search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Resolve who is actually signed in and what they are actually paying for.
 *
 * Done here rather than fetched from the client because getServerAuthContext
 * handles both the JWT cookie and the Supabase session, whereas /api/auth/me
 * reads only the JWT — a Supabase-authenticated user would get a blank sidebar.
 * The sidebar previously hardcoded "Current User / Pro Plan", which contradicted
 * the billing page and the quota the gateway actually enforces.
 */
async function getSidebarUser(): Promise<SidebarUser | undefined> {
  const auth = await getServerAuthContext().catch(() => null);
  if (!auth?.userId) return undefined;

  const user = await prisma.user
    .findUnique({
      where: { id: auth.userId },
      select: {
        email: true,
        fullName: true,
        organization: { select: { subscriptionTier: true } },
      },
    })
    .catch(() => null);
  if (!user) return undefined;

  const name = user.fullName?.trim() || user.email.split("@")[0];
  // Label comes from plans.json via planConfig rather than being re-cased from
  // the enum here, so the sidebar cannot drift from the tier the gateway
  // actually enforces quota against.
  const plan = `${planConfig(normalizeTier(user.organization?.subscriptionTier)).label} Plan`;

  return { name, plan, initials: initialsFrom(name), email: user.email };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarUser = await getSidebarUser();

  return (
    <div className="texture min-h-screen text-[#111111] font-sans selection:bg-[#FF6B00] selection:text-white">
      <Sidebar user={sidebarUser} />
      <main className="md:ml-[260px] min-h-screen pt-16 md:pt-0">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
