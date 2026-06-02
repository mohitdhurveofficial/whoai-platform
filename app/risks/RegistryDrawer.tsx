import React from "react";
import { X, ShieldAlert, Archive, Edit2, Ban } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { RegistryStatusBadge } from "./RegistryStatusBadge";
import { WorkerIdentityCard } from "./WorkerIdentityCard";
import { WorkerPermissionsCard } from "./WorkerPermissionsCard";
import { WorkerPoliciesCard } from "./WorkerPoliciesCard";
import { WorkerToolsCard } from "./WorkerToolsCard";
import { WorkerActivityCard } from "./WorkerActivityCard";
import type { AIWorker } from "./types";

interface RegistryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  worker: AIWorker | null;
}

export function RegistryDrawer({ isOpen, onClose, worker }: RegistryDrawerProps) {
  if (!isOpen || !worker) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{worker.name}</h2>
              <RegistryStatusBadge status={worker.status} />
            </div>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 font-mono">ID: {worker.id} • Created: {worker.createdAt ? new Date(worker.createdAt).toLocaleDateString() : "N/A"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldAlert className={worker.riskLevel === "Critical" ? "text-rose-500" : worker.riskLevel === "High" ? "text-orange-500" : worker.riskLevel === "Medium" ? "text-amber-500" : "text-emerald-500"} />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{worker.riskLevel} Risk Profile</p>
                <p className="text-xs text-slate-500">Risk Score: {worker.riskScore ?? "N/A"} / 100</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Owner / Department</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{worker.owner}</p>
              <p className="text-xs text-slate-500">{worker.department}</p>
            </div>
          </div>
          <WorkerIdentityCard worker={worker} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><WorkerPermissionsCard worker={worker} /><WorkerToolsCard worker={worker} /></div>
          <WorkerPoliciesCard worker={worker} />
          <WorkerActivityCard worker={worker} />
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3 shrink-0">
           <Button variant="ghost" className="flex-1" icon={Edit2} onClick={() => alert("Opening Advanced Agent Configuration...")}>Edit Agent</Button>
           <Button variant="secondary" className="flex-1" icon={Ban} onClick={() => alert(`Agent ${worker.id} has been forcefully disabled.`)}>Disable</Button>
           <Button variant="danger" className="flex-1 text-rose-600" icon={Archive} onClick={() => alert(`Agent ${worker.id} has been permanently archived.`)}>Archive</Button>
        </div>
      </div>
    </>
  );
}
