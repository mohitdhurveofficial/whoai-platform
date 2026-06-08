"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Edit2, Eye, MoreVertical, Pause, Play, Search, Trash2 } from "lucide-react";
import type { AgentAnalyticsRow } from "@/lib/analytics/types";

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AgentsAnalyticsTable({ agents }: { agents: AgentAnalyticsRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [model, setModel] = useState("ALL");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const models = useMemo(
    () => Array.from(new Set(agents.map((agent) => agent.model).filter(Boolean))).sort() as string[],
    [agents],
  );

  const visibleAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "ALL" || agent.status === status;
    const matchesModel = model === "ALL" || agent.model === model;
    return matchesSearch && matchesStatus && matchesModel;
  });

  async function runAction(agentId: string, action: "pause" | "resume" | "delete") {
    const method = action === "delete" ? "DELETE" : "POST";
    const url = action === "delete" ? `/api/agents/${agentId}` : `/api/agents/${agentId}/${action}`;
    setBusy(`${agentId}:${action}`);
    await fetch(url, { method });
    setBusy(null);
    setOpen(null);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-[#EEE8E2] bg-white p-3 shadow-sm md:grid-cols-[1fr_180px_220px]">
        <label className="flex items-center gap-2 rounded-md border border-[#EEE8E2] bg-[#FAF7F3] px-3 py-2 transition-colors focus-within:border-[#555]">
          <Search className="h-4 w-4 text-[#888888]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search agents"
            className="w-full bg-transparent text-[13px] font-medium text-[#111111] outline-none placeholder:text-[#666]"
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-[#EEE8E2] bg-[#FAF7F3] text-[#111111] px-3 py-2 text-[13px] font-medium outline-none hover:border-[#555] transition-colors">
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="QUARANTINED">Quarantined</option>
          <option value="TERMINATED">Terminated</option>
        </select>
        <select value={model} onChange={(event) => setModel(event.target.value)} className="rounded-md border border-[#EEE8E2] bg-[#FAF7F3] text-[#111111] px-3 py-2 text-[13px] font-medium outline-none hover:border-[#555] transition-colors">
          <option value="ALL">All models</option>
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#EEE8E2] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-[13px]">
            <thead className="border-b border-[#EEE8E2] bg-[#FAF7F3] text-[#888888]">
              <tr>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Model</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Today</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Monthly</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Daily Budget</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Monthly Budget</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Requests</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Blocked</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Last Activity</th>
                <th className="px-5 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {visibleAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-[#FAF7F3] transition-colors">
                  <td className="px-5 py-4 font-semibold text-[#111111]">{agent.name}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      agent.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      agent.status === 'PAUSED' ? 'bg-[#A3A3A3]/10 text-[#666666] border-[#A3A3A3]/20' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#666666]">{agent.model ?? "No model yet"}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#111111]">{money(agent.todaySpend)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#111111]">{money(agent.monthlySpend)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#666666]">{money(agent.dailyBudget)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#666666]">{money(agent.monthlyBudget)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#111111]">{agent.requests.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono text-red-600">{agent.blockedRequests.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-[#666666]">
                    {agent.lastActivity ? new Date(agent.lastActivity).toLocaleString() : "Never"}
                  </td>
                  <td className="relative px-5 py-4 text-right">
                    <button onClick={() => setOpen(open === agent.id ? null : agent.id)} className="rounded-md p-1.5 text-[#888888] hover:bg-[#FAF7F3] hover:text-[#111111] transition-colors" aria-label="Open actions">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {open === agent.id && (
                      <div className="absolute right-8 top-10 z-10 w-36 rounded-md border border-[#EEE8E2] bg-white py-1 text-left shadow-2xl">
                        <Link href={`/agents/${agent.id}`} className="flex items-center gap-2 px-3 py-2 text-[#666666] hover:bg-[#FAF7F3] hover:text-[#111111] transition-colors">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                        <Link href={`/agents/${agent.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-[#666666] hover:bg-[#FAF7F3] hover:text-[#111111] transition-colors">
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Link>
                        {agent.status === "ACTIVE" ? (
                          <button disabled={busy === `${agent.id}:pause`} onClick={() => runAction(agent.id, "pause")} className="flex w-full items-center gap-2 px-3 py-2 text-[#FF6B00] hover:bg-[#FAF7F3] transition-colors">
                            <Pause className="h-3.5 w-3.5" /> Pause
                          </button>
                        ) : (
                          <button disabled={busy === `${agent.id}:resume`} onClick={() => runAction(agent.id, "resume")} className="flex w-full items-center gap-2 px-3 py-2 text-[#047857] hover:bg-[#FAF7F3] transition-colors">
                            <Play className="h-3.5 w-3.5" /> Resume
                          </button>
                        )}
                        <button disabled={busy === `${agent.id}:delete`} onClick={() => runAction(agent.id, "delete")} className="flex w-full items-center gap-2 px-3 py-2 text-[#FF0000] hover:bg-[#FF0000]/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!visibleAgents.length && (
                <tr>
                  <td colSpan={11} className="px-5 py-12 text-center text-[#666666]">
                    No agents match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
