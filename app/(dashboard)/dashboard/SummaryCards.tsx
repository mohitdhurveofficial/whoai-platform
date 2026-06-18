"use client";

import { useEffect, useState } from "react";
import { Bot, DollarSign, Activity, Database, AlertTriangle, Wallet } from "lucide-react";

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
    <div className="group rounded-2xl border border-[#EEE8E2] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD9C2] hover:shadow-[0_1px_2px_rgba(17,17,17,0.05),0_20px_44px_-20px_rgba(17,17,17,0.24)]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#666666]">
          {label}
        </span>
        <div className="rounded-lg bg-[#FFF1E8] p-2 text-[#FF6B00]">{icon}</div>
      </div>
      <div className="mt-5 text-3xl font-bold tracking-tight tabular-nums text-[#111111]">{value}</div>
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
    budgetRemaining: null as number | null,
    activeAlerts: 0,
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
        label="Budget Remaining"
        value={loading ? "..." : data.budgetRemaining === null ? "∞" : money(data.budgetRemaining)}
        detail="of organization budget"
        icon={<Wallet className="h-4 w-4" />}
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
      <KpiCard
        label="Active Alerts"
        value={loading ? "..." : numberFormat(data.activeAlerts)}
        detail="requiring attention"
        icon={<AlertTriangle className="h-4 w-4 text-[#FF6B00]" />}
      />
    </section>
  );
}