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
    <div className="rounded-xl border border-[#222] bg-[#111] p-5 shadow-sm transition-colors hover:border-[#333]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">{label}</span>
        <div className="rounded-md bg-[#1A1A1A] border border-[#333] p-2 text-white">{icon}</div>
      </div>
      <div className="mt-5 text-[28px] font-bold tracking-tight text-white">{value}</div>
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
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-white">Usage</h1>
        <p className="mt-1.5 text-[15px] text-[#A3A3A3]">
          Explore request volume, token consumption, spend, and latency across agents and providers.
        </p>
      </header>

      <form className="grid gap-3 rounded-xl border border-[#222] bg-[#111] p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
        <input name="from" type="date" defaultValue={urlParams.get("from") ?? ""} className="rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 text-[13px] font-medium text-white outline-none focus:border-[#555] transition-colors" />
        <input name="to" type="date" defaultValue={urlParams.get("to") ?? ""} className="rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 text-[13px] font-medium text-white outline-none focus:border-[#555] transition-colors" />
        <select name="agentId" defaultValue={urlParams.get("agentId") ?? ""} className="rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 text-[13px] font-medium text-white outline-none focus:border-[#555] transition-colors">
          <option value="">All agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
        <select name="model" defaultValue={urlParams.get("model") ?? ""} className="rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 text-[13px] font-medium text-white outline-none focus:border-[#555] transition-colors">
          <option value="">All models</option>
          {models.map((model) => (
            <option key={model.model} value={model.model}>{model.model}</option>
          ))}
        </select>
        <select name="provider" defaultValue={urlParams.get("provider") ?? ""} className="rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 text-[13px] font-medium text-white outline-none focus:border-[#555] transition-colors">
          <option value="">All providers</option>
          {providers.map((provider) => (
            <option key={provider.provider} value={provider.provider}>{provider.provider}</option>
          ))}
        </select>
        <button className="rounded-md bg-[#FF6B00] hover:bg-[#E65A00] transition-colors px-4 py-2 text-[13px] font-semibold text-white">Apply</button>
      </form>

      {error && (
        <div className="rounded-lg border border-[#FF0000]/20 bg-[#FF0000]/10 p-4 text-[13px] font-medium text-[#FF0000]">{error}</div>
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

      <section className="overflow-hidden rounded-xl border border-[#222] bg-[#111] shadow-sm">
        <div className="border-b border-[#222] p-5 bg-[#0A0A0A]">
          <h2 className="text-[16px] font-bold text-white">Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-[13px]">
            <thead className="border-b border-[#222] bg-[#0A0A0A] text-[#888]">
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
            <tbody className="divide-y divide-[#222]">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-5 py-4 text-[#A3A3A3]">{new Date(request.timestamp).toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-white">{request.agentName}</td>
                  <td className="px-5 py-4 text-[#A3A3A3]">{request.provider}</td>
                  <td className="px-5 py-4 text-[#A3A3A3]">{request.model}</td>
                  <td className="px-5 py-4 text-right font-mono text-white">
                    <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-bold ${request.statusCode >= 400 ? 'bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20' : 'bg-[#047857]/10 text-[#047857] border border-[#047857]/20'}`}>{request.statusCode}</span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-white">{request.tokens.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono text-white">{money(request.spend)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#A3A3A3]">{request.latencyMs} ms</td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#A3A3A3]">
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
