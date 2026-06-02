"use client";

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface RiskChartProps {
  data?: Array<{ name: string; value: number; color: string }>;
  isLoading?: boolean;
}

const fallbackData = [
  { name: "Low", value: 62, color: "#047857" },
  { name: "Warning", value: 24, color: "#b45309" },
  { name: "Risk", value: 10, color: "#ea580c" },
  { name: "Critical", value: 4, color: "#be123c" },
];

export default function RiskChart({ data, isLoading }: RiskChartProps) {
  const chartData = data?.length ? data : fallbackData;

  return (
    <div className="whoai-card flex h-full flex-col p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">Risk Distribution</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Current worker posture by severity.</p>
        </div>
        <button className="text-sm font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">Details</button>
      </div>
      <div className="grid min-h-[260px] min-w-0 flex-1 grid-cols-1 items-center gap-4">
        {isLoading ? (
          <div className="h-full rounded-lg bg-slate-100 dark:bg-slate-900" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d9e0ea", boxShadow: "0 10px 28px rgba(16,24,40,.08)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <span className="ml-auto text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
