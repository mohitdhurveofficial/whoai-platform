import React from "react";
import { X, Bot, Activity, FileText } from "lucide-react";
import type { FirewallDecision } from "./types";
import { FirewallStatusBadge } from "./FirewallStatusBadge";
import { DecisionFlowVisualizer } from "./DecisionFlowVisualizer";
import { PolicyEvaluationCard } from "./PolicyEvaluationCard";
import { RiskEvaluationCard } from "./RiskEvaluationCard";
import { ApprovalRoutingCard } from "./ApprovalRoutingCard";

interface FirewallDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  decision: FirewallDecision | null;
}

export function FirewallDrawer({ isOpen, onClose, decision }: FirewallDrawerProps) {
  if (!isOpen || !decision) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" 
        onClick={onClose} 
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Decision Firewall Review</h2>
              <FirewallStatusBadge status={decision.firewallStatus} />
            </div>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-mono">ID: {decision.id} • {new Date(decision.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 dark:bg-slate-950">
          
          <DecisionFlowVisualizer status={decision.firewallStatus} />

          {/* AI Worker Info */}
          <div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
               <Bot size={16} className="text-slate-400" /> AI Worker Context
             </h3>
             <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Name / Role</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{decision.workerName}</p>
                  <p className="text-xs text-slate-500">{decision.workerRole}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Department</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{decision.department}</p>
                </div>
             </div>
          </div>

          {/* Decision Summary */}
          <div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
               <Activity size={16} className="text-slate-400" /> Decision Summary
             </h3>
             <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Proposed Action</p>
                  <div className="p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-sm leading-relaxed shadow-inner overflow-x-auto">
                    <span className="text-slate-500 mr-2">$</span>{decision.action}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Reasoning</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{decision.reasoning}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Requested Resources</p>
                  <div className="flex flex-wrap gap-2">
                    {decision.requestedResources.map((res, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900/50">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PolicyEvaluationCard decision={decision} />
            <RiskEvaluationCard decision={decision} />
          </div>

          <ApprovalRoutingCard decision={decision} />

          {/* Audit Preview */}
          <div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
               <FileText size={16} className="text-slate-400" /> Audit Preview
             </h3>
             <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300 font-mono text-xs overflow-x-auto">
               <pre>
{JSON.stringify({
  decision_id: decision.id,
  timestamp: decision.createdAt,
  worker: decision.workerName,
  action: decision.action,
  risk_score: decision.riskScore,
  policy_violations: decision.triggeredPolicies.filter(p => p.outcome === "Violation").length,
  final_status: decision.firewallStatus
}, null, 2)}
               </pre>
             </div>
          </div>

        </div>

      </div>
    </>
  );
}