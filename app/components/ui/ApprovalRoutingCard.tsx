import React from "react";
import { Users, CircleCheck, Clock, CircleX } from "lucide-react";
import type { FirewallDecision } from "./types";

export function ApprovalRoutingCard({ decision }: { decision: FirewallDecision }) {
  if (decision.approvalChain.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          Approval Routing
        </h3>
        {decision.currentApprover && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Waiting on: {decision.currentApprover}
          </span>
        )}
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
        {decision.approvalChain.map((chain, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
              {chain.status === "Approved" ? <CircleCheck className="w-3 h-3 text-emerald-500" /> :
               chain.status === "Rejected" ? <CircleX className="w-3 h-3 text-rose-500" /> :
               <Clock className="w-3 h-3 text-amber-500" />}
            </div>
            
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{chain.role}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                  chain.status === "Approved" ? "text-emerald-600" :
                  chain.status === "Rejected" ? "text-rose-600" : "text-amber-600"
                }`}>{chain.status}</span>
              </div>
              {chain.comments && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">&quot;{chain.comments}&quot;</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
