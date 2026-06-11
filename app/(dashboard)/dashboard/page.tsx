import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { AlertTriangle, Activity } from "lucide-react";
import {
  getDashboardSummary,
  getSpendByAgent,
  getSpendByDay,
  getSpendByModel,
  getUsageRequests,
} from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";
import {
  SpendAgentBarChart,
  SpendLineChart,
  SpendModelPieChart,
} from "@/app/components/analytics/DashboardCharts";
import { SummaryCards } from "./SummaryCards";
import { ProviderSetupBanner } from "@/components/ProviderSetupBanner";

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-md border border-dashed border-[#DCD5CD] text-[13px] font-medium text-[#888888]">
      {label}
    </div>
  );
}

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;

export default async function DashboardPage() {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");

  const [summary, spendByDay, spendByAgent, spendByModel, providerCount, recentRequests] = await Promise.all([
    getDashboardSummary(auth.organizationId),
    getSpendByDay(auth.organizationId),
    getSpendByAgent(auth.organizationId),
    getSpendByModel(auth.organizationId),
    prisma.providerCredential.count({ where: { organizationId: auth.organizationId } }),
    getUsageRequests(auth.organizationId),
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

      <ProviderSetupBanner configuredCount={providerCount} />

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

      <section className="overflow-hidden rounded-xl border border-[#EEE8E2] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#EEE8E2] p-5 bg-white">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#F5F5F5] p-2 text-[#111111]">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#111111]">Recent Requests</h2>
              <p className="mt-0.5 text-[13px] text-[#666666]">Real-time traces from the gateway.</p>
            </div>
          </div>
          <Link href="/usage" className="text-[13px] font-semibold text-[#FF6B00] hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-[13px]">
            <thead className="border-b border-[#EEE8E2] bg-[#FAF7F3] text-[#888888]">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Timestamp</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Agent</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Provider / Model</th>
                <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-[11px]">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {recentRequests.slice(0, 5).map((request) => (
                <tr key={request.id} className="hover:bg-[#FAF7F3] transition-colors">
                  <td className="px-5 py-3 text-[#666666]">{new Date(request.timestamp).toLocaleString()}</td>
                  <td className="px-5 py-3 font-semibold text-[#111111]">{request.agentName}</td>
                  <td className="px-5 py-3">
                    <div className="text-[#111111]">{request.provider}</div>
                    <div className="text-[11px] text-[#888888]">{request.model}</div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-bold font-mono ${request.statusCode >= 400 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {request.statusCode}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[#666666]">{request.latencyMs} ms</td>
                </tr>
              ))}
              {!recentRequests.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#666666]">
                    No requests recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
