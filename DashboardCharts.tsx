"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";

const chartData = [
  { time: "08:00", decisions: 120, risks: 12 },
  { time: "10:00", decisions: 210, risks: 15 },
  { time: "12:00", decisions: 180, risks: 8 },
  { time: "14:00", decisions: 320, risks: 25 },
  { time: "16:00", decisions: 250, risks: 18 },
  { time: "18:00", decisions: 190, risks: 10 },
];

export default function DashboardCharts() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <div className="mt-4" style={{ width: '100%', height: 350, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDecisions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Area type="monotone" dataKey="decisions" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorDecisions)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}