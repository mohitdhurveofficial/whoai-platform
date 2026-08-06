"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Cpu,
  BarChart3,
  AlertTriangle,
  Settings,
  KeyRound,
  CreditCard,
  Menu,
  X,
  LogOut,
} from "lucide-react";

export type SidebarUser = {
  name: string;
  plan: string;
  initials: string;
  /** Shown as a tooltip on the name, which is truncated when it overflows. */
  email?: string | null;
};

// `match` lists extra paths that should light this item up. /usage is reachable
// both directly and via the /analytics redirect, so without it the user lands on
// a page with nothing highlighted in the nav.
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Agents", href: "/agents", icon: Cpu },
  { label: "Usage", href: "/usage", icon: BarChart3, match: ["/analytics"] },
  { label: "Alerts", href: "/alerts", icon: AlertTriangle },
  { label: "API Keys", href: "/settings/api-keys", icon: KeyRound },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ user }: { user?: SidebarUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const account = user ?? { name: "Account", plan: "Not signed in", initials: "—" };

  // Escape closes the drawer — a mobile user who opened it must be able to get
  // out without hunting for the toggle.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
        aria-controls="dashboard-sidebar"
        className="fixed left-4 top-4 z-50 rounded-md border border-[#EEE8E2] bg-white p-2 text-[#111111] shadow-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Scrim: tapping outside the drawer closes it, which is the gesture
          every mobile user tries first. */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-[#111111]/30 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-[#EEE8E2] bg-white transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-16 items-center border-b border-[#EEE8E2] px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FF6B00] text-xs font-bold text-white shadow-sm">
              W
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#111111]">WHOAI</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (pathname.startsWith(`${item.href}/`) && item.href !== "/settings") ||
                (item.match?.some((path) => pathname === path) ?? false);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-1 ${
                    active
                      ? "border border-[#FFD9C2] bg-[#FFF5F0] text-[#111111] shadow-sm"
                      : "border border-transparent text-[#666666] hover:bg-[#FAF7F3] hover:text-[#111111]"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-[#FF6B00]" : "text-[#888888]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#EEE8E2] bg-white p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#EEE8E2] bg-[#FAF7F3] text-[12px] font-bold uppercase text-[#111111]">
              {account.initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <span
                className="truncate text-[13px] font-semibold text-[#111111]"
                title={account.email ?? undefined}
              >
                {account.name}
              </span>
              <span className="truncate text-[11px] text-[#666666]">{account.plan}</span>
            </div>
          </div>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.replace("/");
            }}
            className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2 text-[14px] font-medium text-[#666666] transition-colors hover:bg-[#FAF7F3] hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-1"
          >
            <LogOut className="h-[18px] w-[18px] text-[#888888]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
