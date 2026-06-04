"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Cpu,
  BarChart3,
  AlertTriangle,
  Settings,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Agents", href: "/agents", icon: Cpu },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Alerts", href: "/alerts", icon: AlertTriangle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] min-w-[260px] flex-col border-r border-[#EEE8E2] bg-[#FAF7F3] text-[#111111]">
      <div className="flex h-16 items-center px-6 border-b border-[#EEE8E2]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FF6B00] text-sm font-bold text-white shadow-sm">
            W
          </div>
          <span className="text-[15px] font-semibold tracking-tight">WHOAI</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Force active for /dashboard to show the screenshot
            const active = item.href === "/dashboard" || pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-[#FFFFFF] text-[#FF6B00] shadow-sm border border-[#EEE8E2]"
                    : "text-[#111111] hover:bg-[#FFFFFF] hover:shadow-sm hover:border-[#EEE8E2] border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-[#FF6B00]" : "text-[#888888] group-hover:text-[#111111]"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-[#EEE8E2] space-y-2">
        <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium text-[#111111] hover:bg-[#FFFFFF] hover:shadow-sm border border-transparent hover:border-[#EEE8E2] transition-colors">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-[#E8E2D9] flex items-center justify-center text-[10px] font-bold">A</div>
            <span>Acme Corp</span>
          </div>
          <ChevronDown className="h-4 w-4 text-[#888888]" />
        </button>
        <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium text-[#111111] hover:bg-[#FFFFFF] hover:shadow-sm border border-transparent hover:border-[#EEE8E2] transition-colors">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold">M</div>
            <span>Mohit Dhurve</span>
          </div>
        </button>
      </div>
    </aside>
  );
}