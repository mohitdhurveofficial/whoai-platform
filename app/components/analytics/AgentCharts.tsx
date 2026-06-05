"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SpendByDayPoint } from "@/lib/analytics/types";

const moneyTick = (value: number) => `$${Number(value).toLocaleString()}`;

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AgentSpendChart({ data }: { data: SpendByDayPoint[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-full w-full" />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666666" }} minTickGap={24} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666666" }} tickFormatter={moneyTick} />
        <Tooltip formatter={(value) => moneyTick(Number(value))} contentStyle={{ border: "1px solid #EEE8E2", borderRadius: 8 }} />
        <Line type="monotone" dataKey="spend" stroke="#FF6B00" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AgentRequestsChart({ data }: { data: Array<{ date: string; requests: number }> }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-full w-full" />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666666" }} minTickGap={24} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666666" }} />
        <Tooltip contentStyle={{ border: "1px solid #EEE8E2", borderRadius: 8 }} />
        <Bar dataKey="requests" fill="#111111" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
