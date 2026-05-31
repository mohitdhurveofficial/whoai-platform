import React, { useState } from "react";
import { X, ShieldAlert, UserCheck, Key, BookOpen, Clock, Activity, HardDrive, Network, Cloud, Lock } from "lucide-react";
import type { WorkerIdentity } from "./types";
import { IdentityStatusBadge } from "./IdentityStatusBadge";

interface IdentityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  identity: WorkerIdentity | null;
}

export function IdentityDrawer({ isOpen, onClose, identity }: IdentityDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "permissions" | "policies" | "history">("overview");
  
  if (!isOpen || !identity) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "permissions", label: "Permissions", icon: Key },
    { id: "policies", label: "Policies", icon: BookOpen },
    { id: "history", label: "Access History", icon: Clock }
  ] as const;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300">
        
        <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{identity.name}</h2>
                <IdentityStatusBadge status={identity.status} />
              </div>
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 font-mono">ID: {identity.id} • Created: {new Date(identity.creationDate).toLocaleDateString()}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-6 px-6 pt-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950">
          
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="col-span-2 flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><UserCheck size={16} className="text-emerald-500" /> Ownership Tracking</div>
                  {identity.owner === "Unassigned" && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">Unowned</span>}
                </div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Primary Owner</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{identity.owner}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Direct Manager</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{identity.manager}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Department</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{identity.department}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Last Review</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{new Date(identity.lastReviewDate).toLocaleDateString()}</p></div>
              </div>
              
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><ShieldAlert size={16} className={identity.riskScore >= 80 ? "text-rose-500" : "text-amber-500"} /> Identity Risk Scoring: {identity.riskScore}</h3>
                <ul className="space-y-2">
                  {identity.riskFactors.map((factor, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" /> {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Connected Applications & Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {identity.connectedSystems.map(sys => (
                  <div key={sys.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500">
                      {sys.type === "Database" ? <HardDrive size={18} /> : sys.type === "Cloud" ? <Cloud size={18} /> : sys.type === "API" ? <Network size={18} /> : <Lock size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{sys.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{sys.type} • Last Access: {sys.lastAccessed}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "policies" && (
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Assigned Policies</h3>
               {identity.policies.map((pol, i) => (
                 <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
                   <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{pol}</span>
                   <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">Enforced</span>
                 </div>
               ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[2.25rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              {identity.accessHistory.map((evt) => (
                <div key={evt.id} className="relative flex items-center justify-between md:justify-normal group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 shadow-sm z-10">
                    {evt.eventType === "Escalation" ? <ShieldAlert size={14} className="text-rose-500" /> : evt.eventType === "Access" ? <Key size={14} className="text-blue-500" /> : <Clock size={14} />}
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(100%-4rem)] ml-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{evt.action}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Target: {evt.system}</p>
                    <p className="text-xs text-slate-500 italic">&quot;{evt.details}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
