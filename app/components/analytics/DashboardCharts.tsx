"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  SpendByAgentPoint,
  SpendByDayPoint,
  SpendByModelPoint,
} from "@/lib/analytics/types";

const colors = ["#FF6B00", "#111111", "#047857", "#2563EB", "#A855F7", "#D97706"];

const moneyTick = (value: number) => `$${Number(value).toLocaleString()}`;

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SpendLineChart({ data }: { data: SpendByDayPoint[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-full w-full" />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666666" }} minTickGap={24} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666666" }} tickFormatter={moneyTick} />
        <Tooltip formatter={(value) => moneyTick(Number(value))} contentStyle={{ border: "1px solid #EEE8E2", borderRadius: 8 }} />
        <Line type="monotone" dataKey="spend" stroke="#FF6B00" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SpendAgentBarChart({ data }: { data: SpendByAgentPoint[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-full w-full" />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 36, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#F0EBE6" />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666666" }} tickFormatter={moneyTick} />
        <YAxis dataKey="agentName" type="category" width={132} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#111111" }} />
        <Tooltip formatter={(value) => moneyTick(Number(value))} contentStyle={{ border: "1px solid #EEE8E2", borderRadius: 8 }} />
        <Bar dataKey="spend" fill="#111111" radius={[0, 4, 4, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SpendModelPieChart({ data }: { data: SpendByModelPoint[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-full w-full" />;

  return (
    <div className="flex h-full min-h-0 items-center gap-6">
      <div className="h-full min-h-[220px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="spend" nameKey="model" innerRadius={58} outerRadius={86} paddingAngle={2} stroke="none">
              {data.map((entry, index) => (
                <Cell key={entry.model} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => moneyTick(Number(value))} contentStyle={{ border: "1px solid #EEE8E2", borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-[45%] space-y-3">
        {data.slice(0, 6).map((model, index) => (
          <div key={model.model} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2 font-medium text-[#111111]">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="truncate">{model.model}</span>
            </span>
            <span className="shrink-0 font-semibold">{moneyTick(model.spend)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
