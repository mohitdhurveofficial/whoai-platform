import React from 'react';
import { AlertCircle } from 'lucide-react';

interface RiskChartProps {
  data?: any[];
  isLoading?: boolean;
}

export default function RiskChart({ data, isLoading }: RiskChartProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Distribution</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Details</button>
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