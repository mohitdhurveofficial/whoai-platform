"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  CreditCard,
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-[#111] border border-[#333] p-2 shadow md:hidden text-white"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-[#222] bg-[#0A0A0A] transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-16 items-center px-6 border-b border-[#222]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FF6B00] text-xs font-bold text-white shadow-sm">
              W
            </div>
            <span className="text-[15px] font-semibold text-white tracking-tight">WHOAI</span>
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
                      ? "bg-[#1A1A1A] text-white border border-[#333] shadow-sm"
                      : "text-[#A3A3A3] hover:text-white hover:bg-[#111] border border-transparent"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-[#FF6B00]" : "text-[#888]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#222] p-4 bg-[#0A0A0A]">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#222] border border-[#333] text-[12px] text-white font-bold">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white">Current User</span>
              <span className="text-[11px] text-[#A3A3A3]">Pro Plan</span>
            </div>
          </div>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.replace("/");
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium text-[#A3A3A3] hover:text-white hover:bg-[#111] transition-colors border border-transparent"
          >
            <LogOut className="h-[18px] w-[18px] text-[#888]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
