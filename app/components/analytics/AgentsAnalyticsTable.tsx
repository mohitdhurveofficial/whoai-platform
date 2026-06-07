"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Eye, MoreVertical, Pause, Play, Search, Trash2 } from "lucide-react";
import type { AgentAnalyticsRow } from "@/lib/analytics/types";

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AgentsAnalyticsTable({ agents }: { agents: AgentAnalyticsRow[] }) {
  const router = useRouter();
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
      <div className="grid gap-3 rounded-xl border border-[#222] bg-[#111] p-3 shadow-sm md:grid-cols-[1fr_180px_220px]">
        <label className="flex items-center gap-2 rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 transition-colors focus-within:border-[#555]">
          <Search className="h-4 w-4 text-[#888]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search agents"
            className="w-full bg-transparent text-[13px] font-medium text-white outline-none placeholder:text-[#666]"
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-[#333] bg-[#0A0A0A] text-white px-3 py-2 text-[13px] font-medium outline-none hover:border-[#555] transition-colors">
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="QUARANTINED">Quarantined</option>
          <option value="TERMINATED">Terminated</option>
        </select>
        <select value={model} onChange={(event) => setModel(event.target.value)} className="rounded-md border border-[#333] bg-[#0A0A0A] text-white px-3 py-2 text-[13px] font-medium outline-none hover:border-[#555] transition-colors">
          <option value="ALL">All models</option>
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#222] bg-[#111] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-[13px]">
            <thead className="border-b border-[#222] bg-[#0A0A0A] text-[#888]">
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
            <tbody className="divide-y divide-[#222]">
              {visibleAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-5 py-4 font-semibold text-white">{agent.name}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      agent.status === 'ACTIVE' ? 'bg-[#047857]/10 text-[#047857] border-[#047857]/20' :
                      agent.status === 'PAUSED' ? 'bg-[#A3A3A3]/10 text-[#A3A3A3] border-[#A3A3A3]/20' :
                      'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#A3A3A3]">{agent.model ?? "No model yet"}</td>
                  <td className="px-5 py-4 text-right font-mono text-white">{money(agent.todaySpend)}</td>
                  <td className="px-5 py-4 text-right font-mono text-white">{money(agent.monthlySpend)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#A3A3A3]">{money(agent.dailyBudget)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#A3A3A3]">{money(agent.monthlyBudget)}</td>
                  <td className="px-5 py-4 text-right font-mono text-white">{agent.requests.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono text-[#FF0000]">{agent.blockedRequests.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-[#A3A3A3]">
                    {agent.lastActivity ? new Date(agent.lastActivity).toLocaleString() : "Never"}
                  </td>
                  <td className="relative px-5 py-4 text-right">
                    <button onClick={() => setOpen(open === agent.id ? null : agent.id)} className="rounded-md p-1.5 text-[#888] hover:bg-[#222] hover:text-white transition-colors" aria-label="Open actions">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {open === agent.id && (
                      <div className="absolute right-8 top-10 z-10 w-36 rounded-md border border-[#333] bg-[#111] py-1 text-left shadow-2xl">
                        <Link href={`/agents/${agent.id}`} className="flex items-center gap-2 px-3 py-2 text-[#A3A3A3] hover:bg-[#222] hover:text-white transition-colors">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                        <Link href={`/agents/${agent.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-[#A3A3A3] hover:bg-[#222] hover:text-white transition-colors">
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Link>
                        {agent.status === "ACTIVE" ? (
                          <button disabled={busy === `${agent.id}:pause`} onClick={() => runAction(agent.id, "pause")} className="flex w-full items-center gap-2 px-3 py-2 text-[#FF6B00] hover:bg-[#222] transition-colors">
                            <Pause className="h-3.5 w-3.5" /> Pause
                          </button>
                        ) : (
                          <button disabled={busy === `${agent.id}:resume`} onClick={() => runAction(agent.id, "resume")} className="flex w-full items-center gap-2 px-3 py-2 text-[#047857] hover:bg-[#222] transition-colors">
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
                  <td colSpan={11} className="px-5 py-12 text-center text-[#A3A3A3]">
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
