import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { AlertTriangle, Bot, DollarSign, ShieldX } from "lucide-react";
import {
  getDashboardSummary,
  getSpendByAgent,
  getSpendByDay,
  getSpendByModel,
} from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";
import {
  SpendAgentBarChart,
  SpendLineChart,
  SpendModelPieChart,
} from "@/app/components/analytics/DashboardCharts";

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#666666]">{label}</span>
        <div className="rounded-md bg-[#F5F5F5] p-2 text-[#111111]">{icon}</div>
      </div>
      <div className="mt-5 text-3xl font-bold tracking-tight text-[#111111]">{value}</div>
      <div className="mt-2 text-[13px] text-[#666666]">{detail}</div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-md border border-dashed border-[#DCD5CD] text-[13px] font-medium text-[#888888]">
      {label}
    </div>
  );
}

export default async function DashboardPage() {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");

  const [summary, spendByDay, spendByAgent, spendByModel] = await Promise.all([
    getDashboardSummary(auth.organizationId),
    getSpendByDay(auth.organizationId),
    getSpendByAgent(auth.organizationId),
    getSpendByModel(auth.organizationId),
  ]);

  const hasSpend = summary.totalSpend > 0;
  // WHOAI Forecast Engine
const monthlyBudget = 1000;

const projectedSpend =
  summary.totalSpend > 0
    ? Math.round(summary.totalSpend * 4.4)
    : 0;

const budgetUsed =
  monthlyBudget > 0
    ? (summary.totalSpend / monthlyBudget) * 100
    : 0;

const overBudget = projectedSpend >= monthlyBudget;

// Killer Demo
const runawayDemo = {
  budget: 20,
  spend: 26,
  anomaly: true,
  paused: true,
  alertGenerated: true,
};
  

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-6 text-[#111111] md:p-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">
            Executive view of spend, blocked requests, agent activity, and model consumption.
          </p>
        </div>
        <Link
          href="/usage"
          className="inline-flex items-center justify-center rounded-md border border-[#111111] bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white shadow-sm"
        >
          Usage Explorer
        </Link>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Spend"
          value={money(summary.totalSpend)}
          detail="Lifetime organization spend"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Today's Spend"
          value={money(summary.todaySpend)}
          detail="Current UTC day"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Active Agents"
          value={summary.activeAgents.toLocaleString()}
          detail="Agents with ACTIVE status"
          icon={<Bot className="h-4 w-4" />}
        />
        <KpiCard
          label="Blocked Requests"
          value={summary.blockedRequests.toLocaleString()}
          detail="Budget, kill switch, and rate limiter blocks"
          icon={<ShieldX className="h-4 w-4" />}
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-3">
  <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm">
    <h2 className="text-[16px] font-bold">AI Forecasting</h2>

    <div className="mt-4 space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-[#666666]">
          Current Spend
        </span>
        <span className="font-semibold">
          {money(summary.totalSpend)}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-sm text-[#666666]">
          Projected Monthly
        </span>
        <span className="font-semibold">
          {money(projectedSpend)}
        </span>
      </div>

      <div className="rounded-md bg-[#FFF7ED] p-3 text-[13px] text-[#C2410C]">
        WHOAI predicts future AI spending before budgets are exceeded.
      </div>
    </div>
  </div>

  <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm">
    <h2 className="text-[16px] font-bold">
      Budget Status
    </h2>

    <div className="mt-4 space-y-3">
      <div className="flex justify-between">
        <span>Budget</span>
        <span>{money(monthlyBudget)}</span>
      </div>

      <div className="flex justify-between">
        <span>Used</span>
        <span>{budgetUsed.toFixed(1)}%</span>
      </div>

      <div
        className={`font-bold ${
          overBudget
            ? "text-red-600"
            : "text-green-600"
        }`}
      >
        {overBudget
          ? "OVER BUDGET"
          : "HEALTHY"}
      </div>
    </div>
  </div>

  <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm">
    <h2 className="text-[16px] font-bold">
      Runaway Agent Simulator
    </h2>

    <div className="mt-4 space-y-2 text-sm">
      <p>Budget = ${runawayDemo.budget}</p>
      <p>Spend = ${runawayDemo.spend}</p>
      <p>⚠️ Anomaly Detected</p>
      <p>🚨 Alert Generated</p>
      <p>⛔ Agent Paused</p>
    </div>
  </div>
</section>
      {!hasSpend && (
        <div className="flex items-center gap-3 rounded-lg border border-[#EEE8E2] bg-white p-4 text-[13px] text-[#666666] shadow-sm">
          <AlertTriangle className="h-4 w-4 text-[#D97706]" />
          No spend telemetry has been recorded for this organization yet.
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-[16px] font-bold">Spend by Day</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Last 30 days of organization spend.</p>
          </div>
          <div className="h-[320px]">
            {hasSpend ? <SpendLineChart data={spendByDay} /> : <EmptyChart label="No spend data available" />}
          </div>
        </div>

        <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[16px] font-bold">Spend by Agent</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Highest spending agents across all time.</p>
          </div>
          <div className="h-[300px]">
            {spendByAgent.length ? <SpendAgentBarChart data={spendByAgent} /> : <EmptyChart label="No agent spend yet" />}
          </div>
        </div>

        <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[16px] font-bold">Spend by Model</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Distribution of spend across model families.</p>
          </div>
          <div className="h-[300px]">
            {spendByModel.length ? <SpendModelPieChart data={spendByModel} /> : <EmptyChart label="No model spend yet" />}
          </div>
        </div>
      </section>
    </div>
  );
}
  