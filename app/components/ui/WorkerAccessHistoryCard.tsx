import React from "react";
import { Clock, Activity, Key, ShieldAlert } from "lucide-react";
import type { AIIdentity } from "./types";

export function WorkerAccessHistoryCard({ identity }: { identity: AIIdentity }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Clock size={16} className="text-slate-500" /> Access & Audit History
      </h3>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
        {identity.accessHistory.map((evt) => (
          <div key={evt.id} className="relative flex items-start group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 shadow-sm z-10 mt-1">
              {evt.type === "Permission Change" ? <ShieldAlert size={14} className="text-rose-500" /> : evt.type === "Credential Rotation" ? <Key size={14} className="text-amber-500" /> : <Activity size={14} className="text-blue-500" />}
            </div>
            <div className="ml-4 p-4 w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{evt.action}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">{new Date(evt.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Target: {evt.target}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}