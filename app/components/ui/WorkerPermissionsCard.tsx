import React from "react";
import { Database, Wrench, Globe } from "lucide-react";
import type { AIIdentity } from "./types";

export function WorkerPermissionsCard({ identity }: { identity: AIIdentity }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database size={16} className="text-amber-500" /> Access & Permissions
        </h3>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">Least Privilege Score</p>
          <p className={`text-sm font-black ${identity.leastPrivilegeScore < 50 ? "text-rose-500" : identity.leastPrivilegeScore < 80 ? "text-amber-500" : "text-emerald-500"}`}>{identity.leastPrivilegeScore} / 100</p>
        </div>
      </div>
      {identity.permissions.length === 0 ? (
        <p className="text-sm text-slate-500">No permissions assigned.</p>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {identity.permissions.map(perm => (
            <div key={perm.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="mt-0.5 text-slate-400">
                {perm.type === "System" ? <Globe size={16} /> : perm.type === "Data" ? <Database size={16} /> : <Wrench size={16} />}
              </div>
              <div><p className="text-sm font-bold text-slate-900 dark:text-white">{perm.system}</p><p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{perm.accessLevel} Access</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}