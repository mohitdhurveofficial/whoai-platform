import React from "react";
import { TriangleAlert, ShieldAlert, Activity } from "lucide-react";
import type { RiskAlert } from "./types";

export function RiskAlertFeed({ alerts }: { alerts: RiskAlert[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" /> Live Alert Feed
      </h3>
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="mt-0.5">
              {alert.severity === "Critical" ? (
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              ) : (
              <TriangleAlert className="w-5 h-5 text-orange-500" />
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{alert.message}</h4>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{alert.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{alert.workerName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
