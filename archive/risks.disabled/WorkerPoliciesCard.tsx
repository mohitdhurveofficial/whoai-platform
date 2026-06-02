import React from "react";
import { ShieldCheck } from "lucide-react";
import type { AIWorker } from "./types";

export function WorkerPoliciesCard({ worker }: { worker: AIWorker }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-500" /> Assigned Policies
      </h3>
      {worker.policies.length === 0 ? (
        <p className="text-sm text-slate-500">No active policies applied.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {worker.policies.map((policy, idx) => (
            <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              {policy}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}