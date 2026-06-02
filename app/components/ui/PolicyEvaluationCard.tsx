import React from "react";
import { Shield, ShieldAlert, CircleCheck } from "lucide-react";
import type { FirewallDecision } from "./types";

export function PolicyEvaluationCard({ decision }: { decision: FirewallDecision }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-500" />
        Policy Evaluation
      </h3>
      {decision.triggeredPolicies.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
          <CircleCheck className="w-4 h-4" />
          No policies triggered. Clean execution.
        </div>
      ) : (
        <div className="space-y-3">
          {decision.triggeredPolicies.map((policy, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-4 h-4 ${policy.severity === "Critical" ? "text-rose-500" : "text-amber-500"}`} />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{policy.name}</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                policy.outcome === "Blocked" || policy.outcome === "Violation" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" :
                policy.outcome === "Requires Approval" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              }`}>
                {policy.outcome}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}