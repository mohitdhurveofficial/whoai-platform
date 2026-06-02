import React from "react";
import { Bot, Shield, TriangleAlert, Users, CirclePlay, ArrowRight, CircleX } from "lucide-react";
import type { FirewallStatus } from "./types";

interface DecisionFlowVisualizerProps {
  status: FirewallStatus;
}

export function DecisionFlowVisualizer({ status }: DecisionFlowVisualizerProps) {
  const steps = [
    { key: "decision", label: "Decision", icon: Bot, active: true },
    { key: "policy", label: "Policy Check", icon: Shield, active: true },
    { key: "risk", label: "Risk Engine", icon: TriangleAlert, active: true },
    { key: "approval", label: "Approval", icon: Users, active: status === "Pending Approval" || status === "Escalated" || status === "Allowed" || status === "Executed" || status === "Blocked" },
    { key: "execution", label: "Execution", icon: status === "Blocked" || status === "Violation" ? CircleX : CirclePlay, active: status === "Executed" || status === "Blocked" || status === "Violation" },
  ];

  if (status === "Blocked" || status === "Violation") {
    steps[3].active = false;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px]">
        {steps.map((step, idx) => (
          <React.Fragment key={step.key}>
            <div className={`flex flex-col items-center gap-3 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 
                ${step.key === "execution" && (status === "Blocked" || status === "Violation") ? 'border-rose-500 bg-rose-50 text-rose-500 dark:bg-rose-900/30' : 
                  step.active ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 
                  'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800'}`}>
                <step.icon size={20} />
              </div>
              <span className={`text-xs font-semibold ${step.active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 px-4 flex items-center justify-center">
                <ArrowRight className={`w-5 h-5 ${steps[idx + 1].active ? 'text-blue-500' : 'text-slate-300 dark:text-slate-700'}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}