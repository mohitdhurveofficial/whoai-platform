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
  Zap,
  Briefcase,
  FileCheck,
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

const enterpriseItems = [
  { label: "Executive Dashboard", href: "/executive-dashboard", icon: Briefcase },
  { label: "Policy Simulator", href: "/policy-simulator-lab", icon: Zap },
  { label: "Evidence Vault", href: "/evidence-vault", icon: FileCheck },
];

const adminItems = [
  { label: "Team", href: "/team", icon: Users },
  { label: "Security", href: "/security", icon: Lock },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[272px] min-w-[272px] flex-col border-r border-slate-200 bg-white/95 text-slate-950 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/92 dark:text-slate-50 md:flex">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-sm font-semibold text-white shadow-sm shadow-orange-900/20">
            W
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-slate-950 dark:text-white">
              WHOAI
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Governance OS
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-200">
          Enterprise workspace
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Workspace
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-orange-50 text-orange-800 ring-1 ring-orange-200/70 dark:bg-orange-500/12 dark:text-orange-200 dark:ring-orange-400/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? "text-orange-700 dark:text-orange-200" : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Enterprise
          </p>

          {enterpriseItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-orange-50 text-orange-800 ring-1 ring-orange-200/70 dark:bg-orange-500/12 dark:text-orange-200 dark:ring-orange-400/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? "text-orange-700 dark:text-orange-200" : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Admin
          </p>

          {adminItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-orange-50 text-orange-800 ring-1 ring-orange-200/70 dark:bg-orange-500/12 dark:text-orange-200 dark:ring-orange-400/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? "text-orange-700 dark:text-orange-200" : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Governance Score
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            94
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full w-[94%] rounded-full bg-orange-600" />
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            Enterprise Ready
          </p>
        </div>
      </div>
    </aside>
  );
}
