import React from 'react';
import { History, FileText } from 'lucide-react';

export interface AuditLogDTO {
  id: string;
  action: string;
  target: string;
  user: string;
  createdAt: Date;
}

export default function AuditFeed({ events = [], isLoading }: { events?: AuditLogDTO[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 h-64 animate-pulse"></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-slate-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Audit Feed</h2>
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-6 text-slate-500 dark:text-slate-400">
          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm">No audit events recorded</p>
        </div>
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-6">
        {events.map((event) => (
          <div key={event.id} className="relative pl-6">
            <div className="absolute w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full -left-[6.5px] top-1.5 border-2 border-white dark:border-slate-800"></div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{event.action}</p>
              <p className="text-xs text-slate-500 mt-0.5">{event.target} • by {event.user}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(event.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}