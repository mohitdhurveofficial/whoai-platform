import React from 'react';
import { Check, X, CheckSquare } from 'lucide-react';

export interface ApprovalDTO {
  id: string;
  title: string;
  workerName: string;
  risk: string;
  createdAt: Date;
}

interface ApprovalQueueProps {
  approvals?: ApprovalDTO[];
  isLoading?: boolean;
}

export default function ApprovalQueue({ approvals = [], isLoading }: ApprovalQueueProps) {
  if (isLoading) {
     return (
       <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 animate-pulse h-64">
         <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
         <div className="space-y-4">
           <div className="h-12 bg-slate-50 dark:bg-slate-700/50 rounded w-full"></div>
           <div className="h-12 bg-slate-50 dark:bg-slate-700/50 rounded w-full"></div>
         </div>
       </div>
     );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Approval Queue</h2>
      </div>
      
      {approvals.length === 0 ? (
        <div className="p-12 flex-1 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <CheckSquare className="h-10 w-10 mb-3 text-slate-300 dark:text-slate-600" />
          <p className="font-medium text-slate-900 dark:text-slate-200">Inbox Zero</p>
          <p className="text-sm mt-1">No pending actions require human review.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {approvals.map((app) => (
          <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">{app.title}</h3>
              <p className="text-sm text-slate-500 mt-1">Requested by {app.workerName} • {new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                <Check className="h-4 w-4" /> Approve
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}