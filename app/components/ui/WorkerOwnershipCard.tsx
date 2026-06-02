import React from "react";
import { User, UserPlus, Phone, Calendar, Server } from "lucide-react";
import type { AIIdentity } from "./types";

export function WorkerOwnershipCard({ identity }: { identity: AIIdentity }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User size={16} className="text-blue-500" /> Identity Ownership
        </h3>
        {identity.owner === "Unassigned" && <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">Orphaned</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><User size={12}/> Assigned Owner</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{identity.owner}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><UserPlus size={12}/> Backup Owner</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{identity.backupOwner}</p></div>
        <div className="col-span-2"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><Phone size={12}/> Escalation Contact</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{identity.escalationContact}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12}/> Registration</p>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{new Date(identity.registrationDate).toLocaleDateString()}</p>
        </div>
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><Server size={12}/> Environment</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{identity.environment}</p></div>
      </div>
    </div>
  );
}