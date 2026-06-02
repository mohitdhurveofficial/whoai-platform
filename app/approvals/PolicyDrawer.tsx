"use client";

import React, { useState } from "react";
import { tokens } from "@/app/components/ui/tokens";
import { Button } from "@/app/components/ui/Button";
import { PolicyStatusBadge } from "./PolicyStatusBadge";
import { PolicyEditor } from "./PolicyEditor";
import { X, Shield, Users, Activity, FileJson } from "lucide-react";
import type { ExtendedPolicy } from "./types";

interface PolicyDrawerProps {
  policy: ExtendedPolicy | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyDrawer({ policy, isOpen, onClose }: PolicyDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen || !policy) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <>
      <div className={tokens.layout.drawerOverlay} onClick={handleClose} />
      <div className={tokens.layout.drawerContent}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isEditing ? "Edit Policy" : "Policy Details"}
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isEditing ? (
          <PolicyEditor policy={policy} onCancel={() => setIsEditing(false)} onSave={(p) => { console.log('Saved', p); setIsEditing(false); }} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">{policy.name}</h3>
                  <PolicyStatusBadge status={policy.status} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{policy.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Risk Profile</p>
                  <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className={`h-4 w-4 ${policy.riskLevel === "Critical" ? "text-rose-500" : "text-amber-500"}`} />
                    {policy.riskLevel} Risk
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Enforcement</p>
                  <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-blue-500" />
                    {policy.enforcementMode}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Owner</p>
                  <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white">{policy.owner}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned</p>
                  <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-400" />
                    {policy.assignedWorkers} AI Workers
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><FileJson className="h-4 w-4 text-slate-400" />Trigger Conditions</h4>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-4 font-mono text-xs text-green-400 shadow-inner overflow-x-auto">
                  {JSON.stringify(policy.triggerConditions, null, 2)}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <Button variant="primary" className="w-full" onClick={() => setIsEditing(true)}>Edit Policy Details</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}