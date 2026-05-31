import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DecisionChartProps {
  data?: any[];
  isLoading?: boolean;
}

export default function DecisionChart({ data, isLoading }: DecisionChartProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Decision Volume</h2>
        <select className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[200px] border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/30">
        <div className="text-center">
          <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Charting Library Required</p>
          <p className="text-xs text-slate-500 mt-1">Pending installation of Recharts or Chart.js</p>
        </div>
      </div>
    </div>
  );
}