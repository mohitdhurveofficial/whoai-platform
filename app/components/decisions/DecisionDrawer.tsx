import React from "react";
import { Decision, DecisionStatus } from "./types";
import { X, Shield, Activity, FileText, AlertCircle, Check } from "lucide-react";
import DecisionStatusBadge from "./DecisionStatusBadge";
import DecisionRiskBadge from "./DecisionRiskBadge";
import { Button } from "@/app/components/ui/Button";
import { tokens } from "@/app/components/ui/tokens";

interface DecisionDrawerProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: DecisionStatus) => void;
}

export default function DecisionDrawer({ decision, isOpen, onClose, onStatusChange }: DecisionDrawerProps) {
  if (!isOpen || !decision) return null;

  return (
    <>
      <div 
        className={tokens.layout.drawerOverlay} 
        onClick={onClose}
      />
      <div className={tokens.layout.drawerContent}>
        
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Decision Details</h2>
          <Button variant="ghost"
            onClick={onClose}
            className="!p-2 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">{decision.id}</span>
              <span className="text-xs text-slate-400">{decision.createdAt}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{decision.action}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{decision.details}</p>
            
            <div className="flex flex-wrap gap-3">
              <DecisionStatusBadge status={decision.status} />
              <DecisionRiskBadge level={decision.riskLevel} />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                {decision.workerName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">AI Worker</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{decision.workerName}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500 font-medium">Confidence Score</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{decision.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${decision.confidence}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" /> Context & Governance
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Triggered Policy</p>
                <p className="text-sm text-slate-900 dark:text-white font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  {decision.policy}
                </p>
              </div>
              {decision.reason && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">AI Reasoning</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic flex items-start gap-2">
                    <Activity className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    &quot;{decision.reason}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {decision.status === "Pending" || decision.status === "Escalated" ? (
            <div className="flex gap-3">
              <Button 
                variant="danger"
                icon={X}
                onClick={() => onStatusChange(decision.id, "Rejected")}
                className="flex-1"
              >
                Reject
              </Button>
              <Button 
                variant="primary"
                icon={Check}
                onClick={() => onStatusChange(decision.id, "Approved")}
                className="flex-1"
              >
                Approve
              </Button>
            </div>
          ) : (
            <Button 
              variant="secondary"
              icon={AlertCircle}
              onClick={() => onStatusChange(decision.id, "Escalated")}
              className="w-full"
            >
              Re-evaluate / Escalate
            </Button>
          )}
        </div>

      </div>
    </>
  );
}
