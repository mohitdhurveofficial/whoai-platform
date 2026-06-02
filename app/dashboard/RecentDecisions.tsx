import React from 'react';
import { MoreVertical, Inbox } from 'lucide-react';

export interface DecisionDTO {
  id: string;
  AgentName: string;
  title: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  confidenceScore: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | string;
  createdAt: Date;
}

interface RecentDecisionsProps {
  decisions?: DecisionDTO[];
  isLoading?: boolean;
}

export default function RecentDecisions({ decisions = [], isLoading }: RecentDecisionsProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 animate-pulse h-[360px] flex flex-col">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-4 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-50 dark:bg-slate-700/50 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Decisions</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
      </div>
      
      {decisions.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <Inbox className="h-10 w-10 mb-3 text-slate-300 dark:text-slate-600" />
          <p className="font-medium text-slate-900 dark:text-slate-200">No decisions found</p>
          <p className="text-sm mt-1">AI workers have not recorded any actions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-700 dark:text-slate-300">
            <tr>
              <th className="px-6 py-3">Decision</th>
              <th className="px-6 py-3">AI Worker</th>
              <th className="px-6 py-3">Risk Level</th>
              <th className="px-6 py-3">Confidence</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision) => (
              <tr key={decision.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{decision.title}</div>
                  <div className="text-xs text-slate-500">{new Date(decision.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">{decision.AgentName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${decision.riskLevel === 'LOW' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {decision.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${decision.confidenceScore}%` }}></div></div>
                    <span>{decision.confidenceScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">{decision.status}</td>
                <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><MoreVertical className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}