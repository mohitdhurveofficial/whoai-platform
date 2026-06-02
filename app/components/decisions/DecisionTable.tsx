import React, { useState } from "react";
import { Decision, DecisionStatus } from "./types";
import DecisionStatusBadge from "./DecisionStatusBadge";
import DecisionRiskBadge from "./DecisionRiskBadge";
import { MoreHorizontal, Eye, Check, X, AlertTriangle, Inbox } from "lucide-react";

interface DecisionTableProps {
  decisions: Decision[];
  isLoading?: boolean;
  onRowClick: (decision: Decision) => void;
  onStatusChange: (id: string, newStatus: DecisionStatus) => void;
}

export default function DecisionTable({ decisions, isLoading, onRowClick, onStatusChange }: DecisionTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (decisions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center p-12 text-center">
        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
          <Inbox className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No decisions found</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Try adjusting your search filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Decision</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">AI Worker</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Risk Level</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Confidence</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Time</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {decisions.map((decision) => (
              <tr 
                key={decision.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => onRowClick(decision)}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{decision.action}</div>
                  <div className="text-xs text-slate-500 max-w-[200px] truncate">{decision.details}</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{decision.workerName}</td>
                <td className="px-6 py-4">
                  <DecisionRiskBadge level={decision.riskLevel} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${decision.confidence}%` }}></div>
                    </div>
                    <span className="text-slate-600 dark:text-slate-300">{decision.confidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <DecisionStatusBadge status={decision.status} />
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  {decision.createdAt}
                </td>
                <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === decision.id ? null : decision.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {openMenuId === decision.id && (
                    <div className="absolute right-6 top-10 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2" onClick={() => { onRowClick(decision); setOpenMenuId(null); }}>
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                      
                      {decision.status !== 'Approved' && (
                        <button className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2" onClick={() => { onStatusChange(decision.id, 'Approved'); setOpenMenuId(null); }}>
                          <Check className="h-4 w-4" /> Approve
                        </button>
                      )}
                      
                      {decision.status !== 'Rejected' && (
                        <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2" onClick={() => { onStatusChange(decision.id, 'Rejected'); setOpenMenuId(null); }}>
                          <X className="h-4 w-4" /> Reject
                        </button>
                      )}
                      
                      {decision.status !== 'Escalated' && (
                        <button className="w-full text-left px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 flex items-center gap-2" onClick={() => { onStatusChange(decision.id, 'Escalated'); setOpenMenuId(null); }}>
                          <AlertTriangle className="h-4 w-4" /> Escalate
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Cards */}
      <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
        {decisions.map((decision) => (
          <div 
            key={decision.id} 
            className="p-4 space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => onRowClick(decision)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">{decision.action}</h4>
                <p className="text-xs text-slate-500 mt-1">{decision.workerName}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === decision.id ? null : decision.id);
                }}
                className="p-1 text-slate-400"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <DecisionStatusBadge status={decision.status} />
              <DecisionRiskBadge level={decision.riskLevel} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Confidence</p>
                <p className="font-medium text-slate-900 dark:text-white">{decision.confidence}%</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Time</p>
                <p className="font-medium text-slate-900 dark:text-white">{decision.createdAt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}