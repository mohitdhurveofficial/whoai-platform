import { Bot, DollarSign, Activity, Database, AlertTriangle, Wallet } from "lucide-react";
import type { DashboardKpis } from "@/lib/analytics/types";

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const count = (value: number) => value.toLocaleString("en-US");

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
    <div className="group rounded-2xl border border-[#EEE8E2] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.05)] transition-all duration-200 hover:border-[#FFD9C2] hover:shadow-[0_2px_10px_rgba(17,17,17,0.08)]">
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

/**
 * Rendered on the server from the dashboard's single query.
 *
 * These were client components that fetched /api/dashboard/summary on mount, so
 * the six numbers a customer opens the dashboard to see arrived as pulsing grey
 * boxes and only resolved after the HTML landed, a round trip to the API route,
 * and six more serial queries behind it. They are in the payload now.
 *
 * Locale is pinned to en-US rather than the visitor's: money on this page is
 * USD, and letting the browser pick a separator produced a server/client
 * hydration mismatch for anyone outside the US.
 */
export function SummaryCards({ data }: { data: DashboardKpis }) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total Spend"
        value={money(data.totalSpend)}
        detail="Lifetime organization spend"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <KpiCard
        label="Budget Remaining"
        value={data.budgetRemaining === null ? "∞" : money(data.budgetRemaining)}
        detail={data.budgetRemaining === null ? "No monthly budget set" : "of organization budget"}
        icon={<Wallet className="h-4 w-4" />}
      />
      <KpiCard
        label="Total Requests"
        value={count(data.totalRequests)}
        detail="Lifetime API requests"
        icon={<Activity className="h-4 w-4" />}
      />
      <KpiCard
        label="Total Tokens"
        value={count(data.totalTokens)}
        detail="Tokens processed"
        icon={<Database className="h-4 w-4" />}
      />
      <KpiCard
        label="Active Agents"
        value={count(data.activeAgents)}
        detail="Agents with ACTIVE status"
        icon={<Bot className="h-4 w-4" />}
      />
      <KpiCard
        label="Active Alerts"
        value={count(data.activeAlerts)}
        detail="requiring attention"
        icon={<AlertTriangle className="h-4 w-4 text-[#FF6B00]" />}
      />
    </section>
  );
}
