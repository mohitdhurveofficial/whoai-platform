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
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Agents", href: "/agents", icon: Cpu },
  { label: "Decisions", href: "/decisions", icon: ClipboardList },
  { label: "Approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Policies", href: "/policies", icon: FileText },
  { label: "Audit Logs", href: "/logs", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-full max-w-[280px] flex-col border-r border-slate-200 bg-white px-6 py-8 shadow-sm shadow-slate-200/30 md:relative md:h-auto md:max-h-screen">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-600 text-white shadow-card">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-700">WhoAI</p>
          <p className="text-xl font-semibold text-slate-950">Governance Suite</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-50 text-sky-700 shadow-sm shadow-sky-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 shadow-sm shadow-slate-200/30">
        <p className="font-semibold text-slate-950">Governance score</p>
        <p className="mt-3 text-3xl font-semibold text-slate-950">92.4</p>
        <p className="mt-2 text-sm text-slate-500">Operational readiness across agents, policies, and approvals.</p>
      </div>
    </aside>
  );
}
