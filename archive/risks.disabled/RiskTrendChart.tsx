import React from "react";
import { TrendingUp } from "lucide-react";

export function RiskTrendChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [12, 19, 15, 25, 32, 28, 14];
  const max = Math.max(...values);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" /> Risk Trend (7 Days)
      </h3>
      <div className="flex items-end justify-between h-40 gap-2">
        {values.map((val, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1 gap-2 group">
            <div className="w-full relative flex justify-center">
              <div className="w-full max-w-[40px] bg-blue-100 dark:bg-blue-900/30 rounded-t-md relative overflow-hidden group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors" style={{ height: `${(val / max) * 100}%`, minHeight: '20px' }}>
                <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm" style={{ height: '4px' }}></div>
              </div>
              <span className="absolute -top-6 text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
            </div>
            <span className="text-xs font-medium text-slate-500">{days[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}