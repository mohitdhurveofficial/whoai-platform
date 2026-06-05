import { redirect } from "next/navigation";
import type React from "react";
import { Activity, Clock, DollarSign, Hash, Timer } from "lucide-react";
import { parseUsageFilters } from "@/lib/analytics/filters";
import { getSpendByModel, getUsageRequests, getUsageSummary } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
    <div className="rounded-lg border border-[#EEE8E2] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#666666]">{label}</span>
        <div className="rounded-md bg-[#F5F5F5] p-2">{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-bold tracking-tight">{value}</div>
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

  const [summary, requests, agents, models, providers] = await Promise.all([
    error ? null : getUsageSummary(auth.organizationId, safeFilters),
    error ? [] : getUsageRequests(auth.organizationId, safeFilters),
    prisma.agent.findMany({
      where: { organizationId: auth.organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSpendByModel(auth.organizationId),
    prisma.requestLog.findMany({
      where: { organizationId: auth.organizationId },
      distinct: ["provider"],
      select: { provider: true },
      orderBy: { provider: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-6 text-[#111111] md:p-10">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight">Usage</h1>
        <p className="mt-1.5 text-[15px] text-[#666666]">
          Explore request volume, token consumption, spend, and latency across agents and providers.
        </p>
      </header>

      <form className="grid gap-3 rounded-lg border border-[#EEE8E2] bg-white p-4 shadow-sm md:grid-cols-5">
        <input name="from" type="date" defaultValue={urlParams.get("from") ?? ""} className="rounded-md border border-[#EEE8E2] px-3 py-2 text-[13px] font-medium" />
        <input name="to" type="date" defaultValue={urlParams.get("to") ?? ""} className="rounded-md border border-[#EEE8E2] px-3 py-2 text-[13px] font-medium" />
        <select name="agentId" defaultValue={urlParams.get("agentId") ?? ""} className="rounded-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] font-medium">
          <option value="">All agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
        <select name="model" defaultValue={urlParams.get("model") ?? ""} className="rounded-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] font-medium">
          <option value="">All models</option>
          {models.map((model) => (
            <option key={model.model} value={model.model}>{model.model}</option>
          ))}
        </select>
        <select name="provider" defaultValue={urlParams.get("provider") ?? ""} className="rounded-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] font-medium">
          <option value="">All providers</option>
          {providers.map((provider) => (
            <option key={provider.provider} value={provider.provider}>{provider.provider}</option>
          ))}
        </select>
        <button className="rounded-md bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white md:col-start-5">Apply Filters</button>
      </form>

      {error && (
        <div className="rounded-lg border border-[#FEE2E2] bg-[#FFF0F0] p-4 text-[13px] font-medium text-[#DC2626]">{error}</div>
      )}

      {summary && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Metric label="Total Requests" value={summary.totalRequests.toLocaleString()} icon={<Activity className="h-4 w-4" />} />
          <Metric label="Total Tokens" value={summary.totalTokens.toLocaleString()} icon={<Hash className="h-4 w-4" />} />
          <Metric label="Total Spend" value={money(summary.totalSpend)} icon={<DollarSign className="h-4 w-4" />} />
          <Metric label="Average Cost" value={money(summary.averageCost)} icon={<Clock className="h-4 w-4" />} />
          <Metric label="Average Latency" value={`${Math.round(summary.averageLatency)} ms`} icon={<Timer className="h-4 w-4" />} />
        </section>
      )}

      <section className="overflow-hidden rounded-lg border border-[#EEE8E2] bg-white shadow-sm">
        <div className="border-b border-[#EEE8E2] p-5">
          <h2 className="text-[16px] font-bold">Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-[13px]">
            <thead className="bg-[#FAFAFA] text-[#666666]">
              <tr>
                <th className="px-5 py-4 font-semibold">Timestamp</th>
                <th className="px-5 py-4 font-semibold">Agent</th>
                <th className="px-5 py-4 font-semibold">Provider</th>
                <th className="px-5 py-4 font-semibold">Model</th>
                <th className="px-5 py-4 text-right font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Tokens</th>
                <th className="px-5 py-4 text-right font-semibold">Spend</th>
                <th className="px-5 py-4 text-right font-semibold">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-5 py-4 text-[#666666]">{new Date(request.timestamp).toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold">{request.agentName}</td>
                  <td className="px-5 py-4">{request.provider}</td>
                  <td className="px-5 py-4">{request.model}</td>
                  <td className="px-5 py-4 text-right font-mono">{request.statusCode}</td>
                  <td className="px-5 py-4 text-right font-mono">{request.tokens.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono">{money(request.spend)}</td>
                  <td className="px-5 py-4 text-right font-mono">{request.latencyMs} ms</td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#888888]">
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
