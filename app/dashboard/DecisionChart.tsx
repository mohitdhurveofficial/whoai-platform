"use client";

import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DecisionChartProps {
  data?: Array<{ day: string; decisions: number; blocked: number }>;
  isLoading?: boolean;
}

const fallbackData = [
  { day: "Mon", decisions: 1240, blocked: 18 },
  { day: "Tue", decisions: 1488, blocked: 24 },
  { day: "Wed", decisions: 1320, blocked: 19 },
  { day: "Thu", decisions: 1724, blocked: 31 },
  { day: "Fri", decisions: 1610, blocked: 27 },
  { day: "Sat", decisions: 980, blocked: 12 },
  { day: "Sun", decisions: 1128, blocked: 15 },
];

export default function DecisionChart({ data, isLoading }: DecisionChartProps) {
  const chartData = data?.length ? data : fallbackData;

  return (
    <div className="whoai-card flex h-full flex-col p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">Decision Volume</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Approved, blocked, and reviewed runtime actions.</p>
        </div>
        <select className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      <div className="h-[260px] min-w-0 flex-1">
        {isLoading ? (
          <div className="h-full rounded-lg bg-slate-100 dark:bg-slate-900" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="decisionVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d9e0ea", boxShadow: "0 10px 28px rgba(16,24,40,.08)" }} />
              <Area type="monotone" dataKey="decisions" stroke="#ea580c" strokeWidth={2.5} fill="url(#decisionVolume)" />
              <Area type="monotone" dataKey="blocked" stroke="#be123c" strokeWidth={2} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
