import type { Metadata } from "next";
import Sidebar, { type SidebarUser } from "../components/Sidebar";
import { getServerAuthContext } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

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
  const tier = user.organization?.subscriptionTier ?? "FREE";
  const plan = `${tier.charAt(0).toUpperCase()}${tier.slice(1).toLowerCase()} Plan`;

  return { name, plan, initials: initialsFrom(name) };
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
