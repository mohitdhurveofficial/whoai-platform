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
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Agents", href: "/agents", icon: Cpu },
  { label: "Usage", href: "/usage", icon: BarChart3 },
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
        className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 shadow md:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-[#EEE8E2] bg-[#FAF7F3] transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-16 items-center px-6 border-b border-[#EEE8E2]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FF6B00] text-sm font-bold text-white">
              W
            </div>
            <span className="text-[15px] font-semibold">WHOAI</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? "border border-[#EEE8E2] bg-white text-[#FF6B00]"
                      : "text-[#111111] hover:bg-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#EEE8E2] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
              M
            </div>
            <span className="text-sm">Mohit Dhurve</span>
          </div>

          <button
            onClick={async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
  });

  window.location.replace("/");
}}
            className="w-full rounded-md bg-[#FF6B00] px-3 py-2 text-sm font-semibold text-white hover:bg-[#E65A00]"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}