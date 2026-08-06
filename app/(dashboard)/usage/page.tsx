import { redirect } from "next/navigation";
import type React from "react";
import { Activity, Clock, DollarSign, Hash, Timer } from "lucide-react";
import { parseUsageFilters } from "@/lib/analytics/filters";
import { getSpendByModel, getUsageRequests, getUsageSummary } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const filterLabelClass = "text-[11px] font-semibold uppercase tracking-wider text-[#888888]";
// focus-visible (not focus) so a visible ring appears for keyboard users without
// firing on every mouse click. A 1px border tint alone is not a discernible
// focus indicator.
const filterFieldClass =
  "rounded-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] font-medium text-[#111111] transition-colors focus-visible:border-[#FF6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30";

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#EEE8E2] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD9C2] hover:shadow-[0_1px_2px_rgba(17,17,17,0.05),0_20px_44px_-20px_rgba(17,17,17,0.24)]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#888888]">{label}</span>
        <div className="rounded-lg bg-[#FFF1E8] p-2 text-[#FF6B00]">{icon}</div>
      </div>
      <div className="mt-5 text-[28px] font-bold tracking-tight tabular-nums text-[#111111]">{value}</div>
    </div>
  );
}

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === "string") urlParams.set(key, value);
  }
  const { filters, error } = parseUsageFilters(urlParams);
  const safeFilters = filters ?? {};

  // Sequential to prevent PgBouncer deadlock in production.
  const summary = error ? null : await getUsageSummary(auth.organizationId, safeFilters);
  const requests = error ? [] : await getUsageRequests(auth.organizationId, safeFilters);
  const agents = await prisma.agent.findMany({
    where: { organizationId: auth.organizationId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const models = await getSpendByModel(auth.organizationId);
  const providers = await prisma.requestLog.findMany({
    where: { organizationId: auth.organizationId },
    distinct: ["provider"],
    select: { provider: true },
    orderBy: { provider: "asc" },
  });

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">Usage</h1>
        <p className="mt-1.5 text-[15px] text-[#666666]">
          Explore request volume, token consumption, spend, and latency across agents and providers.
        </p>
      </header>

      {/* Every control is labelled: the two date inputs are visually identical,
          so without labels there is no way to tell the start of the range from
          the end. */}
      <form className="grid items-end gap-3 rounded-2xl border border-[#EEE8E2] bg-white p-4 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.16)] md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-from" className={filterLabelClass}>From</label>
          <input id="filter-from" name="from" type="date" defaultValue={urlParams.get("from") ?? ""} className={filterFieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-to" className={filterLabelClass}>To</label>
          <input id="filter-to" name="to" type="date" defaultValue={urlParams.get("to") ?? ""} className={filterFieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-agent" className={filterLabelClass}>Agent</label>
          <select id="filter-agent" name="agentId" defaultValue={urlParams.get("agentId") ?? ""} className={filterFieldClass}>
            <option value="">All agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-model" className={filterLabelClass}>Model</label>
          <select id="filter-model" name="model" defaultValue={urlParams.get("model") ?? ""} className={filterFieldClass}>
            <option value="">All models</option>
            {models.map((model) => (
              <option key={model.model} value={model.model}>{model.model}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-provider" className={filterLabelClass}>Provider</label>
          <select id="filter-provider" name="provider" defaultValue={urlParams.get("provider") ?? ""} className={filterFieldClass}>
            <option value="">All providers</option>
            {providers.map((provider) => (
              <option key={provider.provider} value={provider.provider}>{provider.provider}</option>
            ))}
          </select>
        </div>
        <button className="rounded-md bg-[#FF6B00] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#E65A00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2">
          Apply
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-[13px] font-medium text-red-700">{error}</div>
      )}

      {summary && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Metric label="Total Requests" value={summary.totalRequests.toLocaleString()} icon={<Activity className="h-4 w-4" />} />
          <Metric label="Total Tokens" value={summary.totalTokens.toLocaleString()} icon={<Hash className="h-4 w-4" />} />
          <Metric label="Total Spend" value={money(summary.totalSpend)} icon={<DollarSign className="h-4 w-4" />} />
          <Metric label="Avg Cost" value={money(summary.averageCost)} icon={<Clock className="h-4 w-4" />} />
          <Metric label="Avg Latency" value={`${Math.round(summary.averageLatency)} ms`} icon={<Timer className="h-4 w-4" />} />
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#EEE8E2] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.18)]">
        <div className="border-b border-[#EEE8E2] p-5 bg-[#FAF7F3]">
          <h2 className="text-[16px] font-bold text-[#111111]">Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-[13px]">
            <thead className="border-b border-[#EEE8E2] bg-[#FAF7F3] text-[#888888]">
              <tr>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Timestamp</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Agent</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Provider</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Model</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Tokens</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Spend</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-[#FAF7F3] transition-colors">
                  <td className="px-5 py-4 text-[#666666]">{new Date(request.timestamp).toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-[#111111]">{request.agentName}</td>
                  <td className="px-5 py-4 text-[#666666]">{request.provider}</td>
                  <td className="px-5 py-4 text-[#666666]">{request.model}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#111111]">
                    <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-bold ${request.statusCode >= 400 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>{request.statusCode}</span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-[#111111]">{request.tokens.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#111111]">{money(request.spend)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#666666]">{request.latencyMs} ms</td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#666666]">
                    No requests match the selected filters.
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
