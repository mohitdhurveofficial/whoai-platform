"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Cpu,
  ShieldCheck,
  ClipboardList,
  FileText,
  Sparkles,
  Settings,
  AlertTriangle,
  BarChart3,
  Users,
  Lock,
} from "lucide-react";

const navItems = [
  { label: "Mission Control", href: "/dashboard", icon: Home },
  { label: "AI Workforce", href: "/agents", icon: Cpu },
  { label: "Permissions", href: "/permissions", icon: Lock },
  { label: "Decisions", href: "/decisions", icon: ClipboardList },
  { label: "Approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Policies", href: "/policies", icon: FileText },
  { label: "Policy Studio", href: "/policy-studio", icon: Sparkles },
  { label: "Risk Center", href: "/risks", icon: AlertTriangle },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const adminItems = [
  { label: "Team", href: "/team", icon: Users },
  { label: "Security", href: "/security", icon: Lock },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] min-w-[280px] h-screen border-r border-slate-200 bg-white flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">
          WhoAI
        </h1>
        <p className="text-sm text-slate-500">
          Workforce OS
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="mb-4">
          <p className="px-3 mb-2 text-xs uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <p className="px-3 mb-2 text-xs uppercase tracking-wider text-slate-400">
            Admin
          </p>

          {adminItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            Governance Score
          </p>
          <p className="text-3xl font-bold mt-2">
            94
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Ready
          </p>
        </div>
      </div>
    </aside>
  );
}