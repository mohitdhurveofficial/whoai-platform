"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Cpu,
  BarChart3,
  AlertTriangle,
  Settings,
  KeyRound,
  Menu,
  X,
  LogOut
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Agents", href: "/agents", icon: Cpu },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Alerts", href: "/alerts", icon: AlertTriangle },
  { label: "API Keys", href: "/settings/api-keys", icon: KeyRound },
  { label: "Settings", href: "/settings", icon: Settings },
];

export type SidebarUser = {
  name: string;
  plan: string;
  initials: string;
};

export default function Sidebar({ user }: { user?: SidebarUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const account = user ?? { name: "Account", plan: "Not signed in", initials: "—" };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-white border border-[#EEE8E2] p-2 shadow-sm md:hidden text-[#111111]"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-[#EEE8E2] bg-white transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-16 items-center px-6 border-b border-[#EEE8E2]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FF6B00] text-xs font-bold text-white shadow-sm">
              W
            </div>
            <span className="text-[15px] font-semibold text-[#111111] tracking-tight">WHOAI</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (pathname.startsWith(`${item.href}/`) && item.href !== "/settings");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors ${
                    active
                      ? "bg-[#FFF5F0] text-[#111111] border border-[#FFD9C2] shadow-sm"
                      : "text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F3] border border-transparent"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-[#FF6B00]" : "text-[#888888]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#EEE8E2] p-4 bg-white">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FAF7F3] border border-[#EEE8E2] text-[12px] text-[#111111] font-bold uppercase">
              {account.initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-semibold text-[#111111]">{account.name}</span>
              <span className="truncate text-[11px] text-[#666666]">{account.plan}</span>
            </div>
          </div>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.replace("/");
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F3] transition-colors border border-transparent"
          >
            <LogOut className="h-[18px] w-[18px] text-[#888888]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
