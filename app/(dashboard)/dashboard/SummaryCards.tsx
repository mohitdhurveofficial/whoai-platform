"use client";

import { useEffect, useState } from "react";
import { Bot, DollarSign, Activity, Database } from "lucide-react";

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const numberFormat = (value: number) => value.toLocaleString();

function KpiCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#EEE8E2] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#666666]">
          {label}
        </span>
        <div className="rounded-md bg-[#F5F5F5] p-2 text-[#111111]">{icon}</div>
      </div>
      <div className="mt-5 text-3xl font-bold tracking-tight text-[#111111]">{value}</div>
      <div className="mt-2 text-[13px] text-[#666666]">{detail}</div>
    </div>
  );
}

export function SummaryCards() {
  const [data, setData] = useState({
    totalSpend: 0,
    totalRequests: 0,
    totalTokens: 0,
    activeAgents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSummary() {
      try {
        const res = await fetch("/api/dashboard/summary");

        if (res.ok) {
          const json = await res.json();

          if (mounted) {
            setData(json);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);

        if (mounted) {
          setLoading(false);
        }
      }
    }

        fetchSummary();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total Spend"
        value={loading ? "..." : money(data.totalSpend)}
        detail="Lifetime organization spend"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <KpiCard
        label="Total Requests"
        value={loading ? "..." : numberFormat(data.totalRequests)}
        detail="Lifetime API requests"
        icon={<Activity className="h-4 w-4" />}
      />
      <KpiCard
        label="Total Tokens"
        value={loading ? "..." : numberFormat(data.totalTokens)}
        detail="Tokens processed"
        icon={<Database className="h-4 w-4" />}
      />
      <KpiCard
        label="Active Agents"
        value={loading ? "..." : numberFormat(data.activeAgents)}
        detail="Agents with ACTIVE status"
        icon={<Bot className="h-4 w-4" />}
      />
    </section>
  );
}