import React from 'react';
import { WorkerStatus } from './types';

export default function WorkerStatusBadge({ status }: { status: WorkerStatus }) {
  const styles = {
    Active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    Paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Maintenance: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
  };

  const dots = {
    Active: 'bg-emerald-500',
    Paused: 'bg-amber-500',
    Maintenance: 'bg-slate-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`}></span>
      {status}
    </span>
  );
}