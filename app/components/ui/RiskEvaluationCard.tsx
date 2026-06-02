import React from "react";
import { TriangleAlert } from "lucide-react";
import type { FirewallDecision } from "./types";

export function RiskEvaluationCard({ decision }: { decision: FirewallDecision }) {
  const isCritical = decision.riskLevel === "Critical";
  const isHigh = decision.riskLevel === "High";
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <TriangleAlert className="w-4 h-4 text-amber-500" />
        Risk Evaluation
      </h3>
      <div className="flex items-center gap-4 mb-5">
        <div className={`flex flex-col justify-center items-center w-16 h-16 rounded-full border-4 ${
          isCritical ? "border-rose-500 text-rose-600" : isHigh ? "border-amber-500 text-amber-600" : "border-emerald-500 text-emerald-600"
        }`}>
          <span className="text-xl font-bold">{decision.riskScore}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{decision.riskLevel} Risk Detected</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{decision.riskRecommendation}</p>
        </div>
      </div>
      
      {decision.riskDrivers.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Risk Drivers</p>
          <ul className="space-y-2">
            {decision.riskDrivers.map((driver, idx) => (
              <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                {driver}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}