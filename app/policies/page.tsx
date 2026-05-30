"use client";

import { useMemo, useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { DataTable } from "@/app/components/ui/DataTable";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { policies } from "@/lib/mockData";

const statusVariant = (status: string) =>
  status === "Active" ? "approved" : status === "Paused" ? "pending" : "rejected";

export default function PoliciesPage() {
  const [selected, setSelected] = useState<string | null>(policies[0]?.id ?? null);
  const policy = useMemo(() => policies.find((policy) => policy.id === selected) ?? policies[0], [selected]);

  return (
    <AppShell
      title="Policy management"
      description="Manage compliance rules, enforcement status, and agent assignments from a single enterprise policy hub."
    >
      <PageHeader
        title="Policies"
        description="Review, inspect, and manage enterprise policy coverage across all autonomous agents."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Policy table</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Active governance rules</h2>
            </div>
          </div>

          <DataTable
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Category", accessor: "category" },
              {
                header: "Status",
                cell: (row) => <StatusBadge label={row.status} variant={statusVariant(row.status)} />,
              },
              { header: "Updated", accessor: "lastUpdated" },
              { header: "Assigned agents", accessor: "assignedAgents" },
            ]}
            data={policies}
            keyExtractor={(item) => item.id}
            emptyMessage="No policies available."
          />
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Policy detail</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">{policy.name}</h2>
            </div>
            <StatusBadge label={policy.status} variant={statusVariant(policy.status)} />
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-950">Category</p>
              <p className="mt-2">{policy.category}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Last updated</p>
              <p className="mt-2">{policy.lastUpdated}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Assigned agents</p>
              <p className="mt-2">{policy.assignedAgents} agents</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">You can select a policy in the table to review its details and adjust assignments.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {policies.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`rounded-3xl border p-4 text-left transition ${
                  item.id === selected ? "border-sky-500 bg-sky-50 text-slate-950" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.category}</p>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
