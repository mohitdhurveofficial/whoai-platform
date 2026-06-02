"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

type Organization = {
  id: string;
  name: string;
  slug: string;
};

type Workspace = {
  id: string;
  name: string;
  type: "PRODUCTION" | "STAGING" | "DEMO";
  isDemo?: boolean;
};

interface OrgSwitcherProps {
  organizations: Organization[];
  workspaces: Workspace[];
  currentOrg: Organization;
  currentWorkspace: Workspace;
  onOrgChange: (org: Organization) => void;
  onWorkspaceChange: (workspace: Workspace) => void;
}

export function OrgSwitcher({
  organizations,
  workspaces,
  currentOrg,
  currentWorkspace,
  onOrgChange,
  onWorkspaceChange,
}: OrgSwitcherProps) {
  const [orgOpen, setOrgOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Organization Switcher */}
      <div className="relative">
        <button
          onClick={() => setOrgOpen(!orgOpen)}
          className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 hover:bg-slate-50 transition"
        >
          <span className="truncate">{currentOrg.name}</span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
        </button>

        {orgOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg z-50">
            <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onOrgChange(org);
                    setOrgOpen(false);
                  }}
                  className={`w-full text-left rounded-xl px-3 py-2 text-sm transition ${
                    org.id === currentOrg.id
                      ? "bg-sky-50 text-sky-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {org.name}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-200 p-2">
              <button className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                <Plus className="h-4 w-4" />
                New organization
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workspace Switcher */}
      <div className="relative">
        <button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="truncate">{currentWorkspace.name}</span>
            {currentWorkspace.isDemo && (
              <span className="flex-shrink-0 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Demo
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
        </button>

        {workspaceOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg z-50">
            <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onWorkspaceChange(ws);
                    setWorkspaceOpen(false);
                  }}
                  className={`w-full text-left rounded-xl px-3 py-2 text-sm transition ${
                    ws.id === currentWorkspace.id
                      ? "bg-sky-50 text-sky-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{ws.name}</span>
                    {ws.isDemo && (
                      <span className="text-xs font-semibold text-amber-700">Demo</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
