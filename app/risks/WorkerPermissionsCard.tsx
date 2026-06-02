import React from "react";
import { KeyRound } from "lucide-react";
import type { AIWorker } from "./types";

export function WorkerPermissionsCard({ worker }: { worker: AIWorker }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <KeyRound size={16} className="text-amber-500" /> Permissions
      </h3>
      {worker.permissions.length === 0 ? (
        <p className="text-sm text-slate-500">No special permissions granted.</p>
      ) : (
        <ul className="space-y-2">
          {worker.permissions.map((perm, idx) => (
            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              {perm}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}