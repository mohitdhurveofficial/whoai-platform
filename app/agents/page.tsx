"use client";

import { useMemo, useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { SearchBar } from "@/app/components/ui/SearchBar";
import { DataTable } from "@/app/components/ui/DataTable";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { agents } from "@/lib/mockData";

const sortOptions = [
  { label: "Recently active", value: "recent" },
  { label: "High risk first", value: "risk" },
  { label: "Approval rate", value: "approval" },
];

export default function AgentsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  const filteredAgents = useMemo(() => {
    const normalized = query.toLowerCase();
    return agents
      .filter((agent) => {
        const matchesQuery =
          agent.name.toLowerCase().includes(normalized) ||
          agent.owner.toLowerCase().includes(normalized) ||
          agent.policies.some((policy) => policy.toLowerCase().includes(normalized));

        const matchesStatus = statusFilter === "All" || agent.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "risk") {
          const rank = { High: 3, Medium: 2, Low: 1 };
          return rank[b.riskLevel] - rank[a.riskLevel];
        }
        if (sortBy === "approval") {
          return b.approvalRate - a.approvalRate;
        }
        return b.decisions - a.decisions;
      });
  }, [query, statusFilter, sortBy]);

  return (
    <AppShell
      title="Agents registry"
      description="Review your active AI agents, risk posture, assigned policies, and operational status."
    >
      <PageHeader
        title="Agent operations"
        description="Search, filter, and prioritize agent activity across your enterprise governance model."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Sort by: {sortOptions.find((option) => option.value === sortBy)?.label}
            </div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="grid gap-4 md:grid-cols-3">
            <SearchBar placeholder="Search agents, owners, policies..." value={query} onChange={setQuery} />
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</label>
              <select
                className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Paused</option>
                <option>Archived</option>
              </select>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sort</label>
              <select
                className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DataTable
            columns={[
              { header: "Agent", accessor: "name" },
              {
                header: "Owner",
                cell: (row) => <span className="text-slate-600">{row.owner}</span>,
              },
              {
                header: "Status",
                cell: (row) => <StatusBadge label={row.status} variant={row.status === "Active" ? "approved" : row.status === "Paused" ? "pending" : "rejected"} />,
              },
              {
                header: "Risk",
                cell: (row) => <StatusBadge label={row.riskLevel} variant={row.riskLevel === "High" ? "high" : row.riskLevel === "Medium" ? "medium" : "low"} />,
              },
              { header: "Last activity", cell: (row) => <span className="text-slate-600">{row.lastActivity}</span> },
              { header: "Policies", cell: (row) => <span className="text-slate-600">{row.policies.join(", ")}</span> },
            ]}
            data={filteredAgents}
            keyExtractor={(item) => item.id}
            emptyMessage="No agents matched your search criteria."
          />
        </div>

        <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quick summary</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Agent risk snapshot</h2>
          </div>
          <div className="space-y-4">
            {filteredAgents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{agent.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{agent.policies.join(", ")}</p>
                  </div>
                  <StatusBadge
                    label={agent.riskLevel}
                    variant={agent.riskLevel === "High" ? "high" : agent.riskLevel === "Medium" ? "medium" : "low"}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500">Last activity: {agent.lastActivity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
