import React from "react";
import { FileCheck, TriangleAlert, ShieldAlert } from "lucide-react";
import type { AIIdentity } from "./types";

export function WorkerPolicyCard({ identity }: { identity: AIIdentity }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <FileCheck size={16} className="text-blue-500" /> IAM Policy Enforcement
      </h3>
      {identity.policies.length === 0 ? (
        <p className="text-sm text-slate-500">No active IAM policies.</p>
      ) : (
        <div className="space-y-3">
          {identity.policies.map(policy => (
            <div key={policy.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><ShieldAlert size={14} className="text-slate-400" /><span className="text-sm font-bold text-slate-900 dark:text-white">{policy.name}</span></div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider ${policy.status === "Compliant" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{policy.status === "Compliant" ? <FileCheck size={10} className="inline mr-1"/> : <TriangleAlert size={10} className="inline mr-1"/>}{policy.status}</span>
              </div>
              <div className="flex gap-2 text-xs font-medium text-slate-500 ml-5"><span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">Mode: {policy.enforcement}</span>{policy.requiresApproval && <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded">Requires Approval</span>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}