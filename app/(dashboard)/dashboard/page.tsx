import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { AlertTriangle } from "lucide-react";
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
import { SummaryCards } from "./SummaryCards";

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

      <SummaryCards />

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
