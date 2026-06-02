import React from 'react';
import { Server, Cpu, Network } from 'lucide-react';

interface SystemHealthProps {
  status?: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  isLoading?: boolean;
}

export default function SystemHealth({ status, isLoading }: SystemHealthProps) {
  if (isLoading || !status) {
    return <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 h-48 animate-pulse"></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Health</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">API Gateway</span>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${status === 'HEALTHY' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'}`}>{status === 'HEALTHY' ? 'Operational' : status}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Inference Engine</span>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${status === 'HEALTHY' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'}`}>{status === 'HEALTHY' ? 'Operational' : status}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Policy Sync</span>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${status === 'HEALTHY' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'}`}>{status === 'HEALTHY' ? 'Operational' : status}</span>
        </div>
      </div>
    </div>
  );
}