import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { AlertTriangle, Activity, ArrowRight } from "lucide-react";
import {
  getDashboardSummary,
  getSpendByAgent,
  getSpendByDay,
  getSpendByModel,
  getUsageRequests,
} from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";
import {
  SpendAgentBarChart,
  SpendLineChart,
  SpendModelPieChart,
} from "@/app/components/analytics/DashboardCharts";
import { SummaryCards } from "./SummaryCards";
import { ProviderSetupBanner } from "@/components/ProviderSetupBanner";
import { forecastSpend } from "@/lib/predictive-budget";
import { efficiencyLeaderboard } from "@/lib/efficiency-score";

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

  // Batched raw SQL queries eliminate PgBouncer connection overhead.
  const summary = await getDashboardSummary(auth.organizationId);
  const spendByDay = await getSpendByDay(auth.organizationId);
  const spendByAgent = await getSpendByAgent(auth.organizationId);
  const spendByModel = await getSpendByModel(auth.organizationId);
  const recentRequests = await getUsageRequests(auth.organizationId);

  // AI-powered features
  const [forecast, leaderboard] = await Promise.all([
    forecastSpend(auth.organizationId, 30).catch(() => null),
    efficiencyLeaderboard(auth.organizationId, 7).catch(() => []),
  ]);

  const providerCount = summary.providerCount;

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
          className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(255,107,0,0.5)] transition-colors hover:bg-[#E85F00]"
        >
          Usage Explorer
        </Link>
      </header>

      <ProviderSetupBanner configuredCount={providerCount} />

      <SummaryCards />

      {/* AI-POWERED FORECAST */}
      {forecast && (
        <section className="rounded-2xl border border-[#FF6B00]/20 bg-[#FFF8F3] p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(255,107,0,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#111111]">Predictive Budget AI</h2>
              <p className="mt-1 text-[13px] text-[#666666]">
                Forecast: ${forecast.nextDay}/day · ${forecast.nextWeek}/week · ${forecast.nextMonth}/month
                {forecast.alert && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#DC2626] px-2 py-0.5 text-[11px] font-bold text-white">
                    ALERT: Budget exhaustion in {forecast.daysUntilExhaustion} days
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] text-[#888888]">Suggested daily limit</p>
                <p className="text-[18px] font-bold text-[#FF6B00]">${forecast.suggestedDailyBudget}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#888888]">Confidence</p>
                <p className="text-[18px] font-bold">{Math.round((1 - forecast.confidence) * 100)}%</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#FF6B00]/15 pt-4">
            <Link
              href="/agents"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#FF6B00] transition-colors hover:text-[#E85F00]"
            >
              Review budget guardrails <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/usage"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#666666] transition-colors hover:text-[#111111]"
            >
              See top cost drivers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* AGENT EFFICIENCY LEADERBOARD */}
      {leaderboard.length > 0 && (
        <section className="rounded-2xl border border-[#EEE8E2] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.18)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#111111]">Agent Efficiency Leaderboard</h2>
              <p className="mt-1 text-[13px] text-[#666666]">Cost-per-outcome scoring — higher is better.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leaderboard.slice(0, 6).map((agent) => (
              <div
                key={agent.agentId}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  agent.score >= 85
                    ? "border-[#047857]/30 bg-[#ECFDF5]"
                    : agent.score >= 60
                    ? "border-[#D97706]/30 bg-[#FFFBEB]"
                    : "border-[#DC2626]/30 bg-[#FEF2F2]"
                }`}
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#111111]">{agent.agentName}</p>
                  <p className="text-[11px] text-[#666666]">
                    {agent.trend === "improving" ? "Improving" : agent.trend === "degrading" ? "Degrading" : "Stable"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-[20px] font-extrabold ${
                    agent.score >= 85 ? "text-[#047857]" : agent.score >= 60 ? "text-[#D97706]" : "text-[#DC2626]"
                  }`}>
                    {agent.grade}
                  </p>
                  <p className="text-[11px] text-[#888888]">{agent.score}/100</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasSpend && (
        <div className="flex items-center gap-3 rounded-lg border border-[#EEE8E2] bg-white p-4 text-[13px] text-[#666666] shadow-sm">
          <AlertTriangle className="h-4 w-4 text-[#D97706]" />
          No spend telemetry has been recorded for this organization yet.
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#EEE8E2] bg-white p-6 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.18)] xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-[16px] font-bold">Spend by Day</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Last 30 days of organization spend.</p>
          </div>
          <div className="h-[320px]">
            {hasSpend ? <SpendLineChart data={spendByDay} /> : <EmptyChart label="No spend data available" />}
          </div>
        </div>

        <div className="rounded-2xl border border-[#EEE8E2] bg-white p-6 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.18)] transition-shadow hover:shadow-[0_1px_2px_rgba(17,17,17,0.05),0_18px_40px_-20px_rgba(17,17,17,0.22)]">
          <div className="mb-5">
            <h2 className="text-[16px] font-bold">Spend by Agent</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Highest spending agents across all time.</p>
          </div>
          <div className="h-[300px]">
            {spendByAgent.length ? <SpendAgentBarChart data={spendByAgent} /> : <EmptyChart label="No agent spend yet" />}
          </div>
        </div>

        <div className="rounded-2xl border border-[#EEE8E2] bg-white p-6 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.18)] transition-shadow hover:shadow-[0_1px_2px_rgba(17,17,17,0.05),0_18px_40px_-20px_rgba(17,17,17,0.22)]">
          <div className="mb-5">
            <h2 className="text-[16px] font-bold">Spend by Model</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Distribution of spend across model families.</p>
          </div>
          <div className="h-[300px]">
            {spendByModel.length ? <SpendModelPieChart data={spendByModel} /> : <EmptyChart label="No model spend yet" />}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#EEE8E2] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.18)]">
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
