import React from "react";
import { User, Server, Hash } from "lucide-react";
import type { AIWorker } from "./types";

export function WorkerIdentityCard({ worker }: { worker: AIWorker }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <User size={16} className="text-blue-500" /> Identity & Profile
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{worker.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><Server size={12} /> Platform</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{worker.platform}</p>
            <p className="text-xs text-slate-500 mt-0.5">{worker.model}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><Hash size={12} /> Resource Cost</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">${worker.monthlyCost.toFixed(2)}/mo</p>
            <p className="text-xs text-slate-500 mt-0.5">Mem: {worker.memoryUsage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}