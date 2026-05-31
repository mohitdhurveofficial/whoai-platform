import React from "react";
import { Activity, CircleCheck } from "lucide-react";
import type { AIWorker } from "./types";

export function WorkerActivityCard({ worker }: { worker: AIWorker }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm col-span-1 md:col-span-2">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity size={16} className="text-blue-500" /> Recent Activity
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Decisions</p>
          {worker.recentDecisions.length === 0 ? <p className="text-sm text-slate-500">None</p> : (
            <ul className="space-y-2">
              {worker.recentDecisions.map((dec, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {dec}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Approvals required</p>
          {worker.recentApprovals.length === 0 ? <p className="text-sm text-slate-500">None</p> : (
            <ul className="space-y-2">
              {worker.recentApprovals.map((app, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"><CircleCheck className="w-3 h-3 text-slate-400" /> {app}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}