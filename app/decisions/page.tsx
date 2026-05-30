"use client";

import { useMemo, useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { SearchBar } from "@/app/components/ui/SearchBar";
import { DataTable } from "@/app/components/ui/DataTable";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { decisions } from "@/lib/mockData";

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Risk score", value: "risk" },
  { label: "Confidence", value: "confidence" },
];

export default function DecisionsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const filteredDecisions = useMemo(() => {
    const normalized = query.toLowerCase();
    return decisions
      .filter((decision) => {
        const matchesQuery =
          decision.id.toLowerCase().includes(normalized) ||
          decision.agent.toLowerCase().includes(normalized) ||
          decision.action.toLowerCase().includes(normalized) ||
          decision.policy.toLowerCase().includes(normalized);

        const matchesStatus =
          statusFilter === "All" || decision.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "risk") {
          return b.riskScore - a.riskScore;
        }
        if (sortBy === "newest") {
          return b.id.localeCompare(a.id);
        }
        return 0;
      });
  }, [query, statusFilter, sortBy]);

  return (
    <AppShell
      title="Decision monitoring"
      description="Review AI decisions with risk context, policy triggers, and approval status."
    >
      <PageHeader
        title="Decision intelligence"
        description="Filter and inspect recent AI actions with enterprise-level risk and compliance visibility."
      />

      <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <div className="grid gap-4 md:grid-cols-3">
          <SearchBar placeholder="Search decision ID, agent, policy..." value={query} onChange={setQuery} />
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</label>
            <select
              className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
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
            { header: "Decision ID", accessor: "id" },
            { header: "Agent", accessor: "agent" },
            { header: "Action", accessor: "action" },
            {
              header: "Risk score",
              cell: (row) => (
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={row.risk}
                    variant={row.risk === "High Risk" ? "high" : row.risk === "Medium Risk" ? "medium" : "low"}
                  />
                  <span className="text-slate-500">{row.riskScore}</span>
                </div>
              ),
            },
            { header: "Policy", accessor: "policy" },
            {
              header: "Status",
              cell: (row) => (
                <StatusBadge
                  label={row.status}
                  variant={row.status === "Approved" ? "approved" : row.status === "Pending" ? "pending" : "rejected"}
                />
              ),
            },
            { header: "Timestamp", accessor: "timestamp" },
          ]}
          data={filteredDecisions}
          keyExtractor={(item) => item.id}
          emptyMessage="No decisions match the current filter."
        />
      </div>
    </AppShell>
  );
}
