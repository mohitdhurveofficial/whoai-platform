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
  BookOpen,
} from "lucide-react";
import { OrgSwitcher } from "./OrgSwitcher";

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
  { label: "Audit & Trust", href: "/audit", icon: Sparkles },
];

const settingsItems = [
  { label: "Team Management", href: "/team", icon: Users },
  { label: "Security", href: "/security", icon: Lock },
  { label: "Developer Settings", href: "/dev-settings", icon: Settings },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Mock data - replace with real data from API
const mockOrganizations = [
  { id: "1", name: "Acme Corporation", slug: "acme" },
  { id: "2", name: "Tech Startup Inc", slug: "techstartup" },
];

const mockWorkspaces = [
  { id: "1", name: "Production", type: "PRODUCTION" as const },
  { id: "2", name: "Staging", type: "STAGING" as const },
  { id: "3", name: "Demo", type: "DEMO" as const, isDemo: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const currentOrg = mockOrganizations[0];
  const currentWorkspace = mockWorkspaces[0];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-full max-w-[280px] flex-col border-r border-slate-200 bg-white px-6 py-8 shadow-sm shadow-slate-200/30 md:relative md:h-auto md:max-h-screen overflow-y-auto">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-600 text-white shadow-card">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-700">WhoAI</p>
          <p className="text-xl font-semibold text-slate-950">Workforce OS</p>
        </div>
      </div>

      {/* Organization & Workspace Switcher */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <OrgSwitcher
          organizations={mockOrganizations}
          workspaces={mockWorkspaces}
          currentOrg={currentOrg}
          currentWorkspace={currentWorkspace}
          onOrgChange={(org) => console.log("Org changed:", org)}
          onWorkspaceChange={(ws) => console.log("Workspace changed:", ws)}
        />
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 flex-1">
        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
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

      {/* Settings Navigation */}
      <div className="space-y-1 border-t border-slate-200 pt-6">
        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Admin</p>
        {settingsItems.map((item) => {
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
      </div>

      {/* Governance Score */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 shadow-sm shadow-slate-200/30">
        <p className="font-semibold text-slate-950">Governance Score</p>
        <p className="mt-3 text-3xl font-semibold text-slate-950">92.4</p>
        <p className="mt-2 text-sm text-slate-500">Operational readiness across all workers.</p>
      </div>
    </aside>
  );
}
