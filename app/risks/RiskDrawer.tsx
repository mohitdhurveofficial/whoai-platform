import React from "react";
import { X, TriangleAlert, Activity, ShieldAlert, GitMerge } from "lucide-react";
import type { RiskEvent } from "./types";
import { RiskSeverityBadge, RiskStatusBadge } from "./RiskStatusBadge";

interface RiskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: RiskEvent | null;
}

export function RiskDrawer({ isOpen, onClose, event }: RiskDrawerProps) {
  if (!isOpen || !event) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Risk Event Review</h2>
              <RiskSeverityBadge severity={event.severity} />
              <RiskStatusBadge status={event.status} />
            </div>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 font-mono">ID: {event.id} • {new Date(event.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 dark:bg-slate-950">
          
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Worker</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{event.workerName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Department</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{event.department}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Risk Category</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{event.category}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Risk Score</p>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{event.score} / 100</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <TriangleAlert size={16} className="text-orange-500" /> Event Description
            </h3>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{event.riskType}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{event.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Activity size={16} className="text-slate-400" /> Risk Drivers
              </h3>
              <ul className="space-y-2">
                {event.riskDrivers.map((driver, i) => (
                  <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    {driver}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <ShieldAlert size={16} className="text-slate-400" /> Triggered Policies
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.triggeredPolicies.map((policy, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-900/50">
                    {policy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <GitMerge size={16} className="text-slate-400" /> Recommended Actions
            </h3>
            <div className="space-y-2">
              {event.recommendedActions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{action}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}