"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, Zap, Database, Users, FileText, Settings, Activity } from "lucide-react";

type CommandGroup = {
  label: string;
  commands: Array<{
    label: string;
    description?: string;
    href?: string;
    action?: () => void;
    icon: ReactNode;
  }>;
};

const COMMAND_GROUPS: CommandGroup[] = [
  {
    label: "Navigation",
    commands: [
      { label: "Mission Control", href: "/dashboard", icon: <Activity className="h-4 w-4" /> },
      { label: "AI Workforce", href: "/agents", icon: <Zap className="h-4 w-4" /> },
      { label: "Permissions", href: "/permissions", icon: <Users className="h-4 w-4" /> },
      { label: "Policy Studio", href: "/policy-studio", icon: <FileText className="h-4 w-4" /> },
      { label: "Decisions", href: "/decisions", icon: <Database className="h-4 w-4" /> },
      { label: "Approvals", href: "/approvals", icon: <Zap className="h-4 w-4" /> },
      { label: "Analytics", href: "/analytics", icon: <Activity className="h-4 w-4" /> },
      { label: "Audit & Trust", href: "/audit", icon: <Zap className="h-4 w-4" /> },
      { label: "Developer Settings", href: "/dev-settings", icon: <Settings className="h-4 w-4" /> },
    ],
  },
  {
    label: "Settings",
    commands: [
      { label: "Team Management", href: "/team", icon: <Users className="h-4 w-4" /> },
      { label: "Security", href: "/security", icon: <Users className="h-4 w-4" /> },
      { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
        if (!isOpen) setSearchQuery("");
      }

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredGroups = COMMAND_GROUPS.map((group) => ({
    ...group,
    commands: group.commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.commands.length > 0);

  const handleCommand = (command: CommandGroup["commands"][0]) => {
    if (command.href) {
      router.push(command.href);
    } else if (command.action) {
      command.action();
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Global command trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600 border border-slate-300 shadow-md hover:bg-slate-50"
      >
        <Search className="h-4 w-4" />
        <span>Cmd+K</span>
      </button>

      {/* Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commands or navigate..."
                className="flex-1 bg-transparent outline-none text-sm"
                autoFocus
              />
              <kbd className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-600">
                  No commands found.
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-4 py-2 pt-4 first:pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {group.label}
                    </div>
                    {group.commands.map((command, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCommand(command)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sky-50 transition text-left"
                      >
                        <div className="text-slate-400">{command.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{command.label}</p>
                          {command.description && (
                            <p className="text-xs text-slate-600 truncate">{command.description}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
              Press <kbd className="rounded bg-white border border-slate-300 px-1.5 py-0.5">↵</kbd> to execute,{" "}
              <kbd className="rounded bg-white border border-slate-300 px-1.5 py-0.5">↑ ↓</kbd> to navigate
            </div>
          </div>
        </div>
      )}
    </>
  );
}
