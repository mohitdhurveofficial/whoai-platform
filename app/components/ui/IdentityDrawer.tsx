import React, { useState } from "react";
import { X, UserCheck, Key, ShieldAlert, Clock, OctagonAlert } from "lucide-react";
import type { AIIdentity } from "./types";
import { IdentityStatusBadge } from "./IdentityStatusBadge";
import { WorkerOwnershipCard } from "./WorkerOwnershipCard";
import { WorkerPermissionsCard } from "./WorkerPermissionsCard";
import { WorkerCredentialsCard } from "./WorkerCredentialsCard";
import { WorkerSecretsCard } from "./WorkerSecretsCard";
import { WorkerPolicyCard } from "./WorkerPolicyCard";
import { WorkerAccessHistoryCard } from "./WorkerAccessHistoryCard";

interface IdentityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  identity: AIIdentity | null;
}

export function IdentityDrawer({ isOpen, onClose, identity }: IdentityDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "credentials" | "policies" | "history">("overview");
  
  if (!isOpen || !identity) return null;

  const tabs = [
    { id: "overview", label: "Identity & Access", icon: UserCheck },
    { id: "credentials", label: "Credentials & Secrets", icon: Key },
    { id: "policies", label: "IAM Policies", icon: ShieldAlert },
    { id: "history", label: "Audit History", icon: Clock }
  ] as const;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300">
        
        <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{identity.name}</h2>
                <IdentityStatusBadge status={identity.status} />
              </div>
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 font-mono">ID: {identity.id} • {identity.description}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-6 px-6 pt-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-950">
          {identity.riskIndicators.length > 0 && activeTab === "overview" && (
            <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-900/50 flex items-start gap-3">
              <OctagonAlert className="text-rose-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-rose-800 dark:text-rose-400">Risk Indicators Detected</p>
                <ul className="mt-1 list-disc list-inside text-xs text-rose-700 dark:text-rose-300 ml-4">{identity.riskIndicators.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            </div>
          )}

          {activeTab === "overview" && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><WorkerOwnershipCard identity={identity} /><WorkerPermissionsCard identity={identity} /></div>)}
          {activeTab === "credentials" && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><WorkerCredentialsCard identity={identity} /><WorkerSecretsCard identity={identity} /></div>)}
          {activeTab === "policies" && (<div className="max-w-2xl"><WorkerPolicyCard identity={identity} /></div>)}
          {activeTab === "history" && (<div className="max-w-2xl"><WorkerAccessHistoryCard identity={identity} /></div>)}
        </div>
      </div>
    </>
  );
}