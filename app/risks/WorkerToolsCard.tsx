import React from "react";
import { Wrench } from "lucide-react";
import type { AIWorker } from "./types";

export function WorkerToolsCard({ worker }: { worker: AIWorker }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Wrench size={16} className="text-purple-500" /> Connected Tools
      </h3>
      {worker.tools.length === 0 ? (
        <p className="text-sm text-slate-500">No tools connected.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {worker.tools.map((tool, idx) => (
            <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-100 dark:border-purple-900/50">
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}