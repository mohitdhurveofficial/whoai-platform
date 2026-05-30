"use client";

import { useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { approvals } from "@/lib/mockData";

export default function ApprovalsPage() {
  const [queue, setQueue] = useState(approvals);

  function handleAction(id: string) {
    setQueue((current) => current.filter((item) => item.id !== id));
  }

  return (
    <AppShell
      title="Approval center"
      description="Manage approvals with risk context, policy triggers, and action state."
    >
      <PageHeader
        title="Human review workspace"
        description="Approve, reject, or escalate high-impact agent actions in a well organized interface."
      />

      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm shadow-slate-200/30">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">All clear</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">No pending approvals</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Every request has been resolved or escalated. The governance queue is up to date.</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {queue.map((approval) => (
              <div key={approval.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{approval.id}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">{approval.request}</h3>
                    <p className="mt-3 text-sm text-slate-600">Agent: {approval.agent}</p>
                    <p className="mt-1 text-sm text-slate-600">Owner: {approval.owner}</p>
                  </div>
                  <StatusBadge
                    label={approval.risk}
                    variant={approval.risk === "High Risk" ? "high" : approval.risk === "Medium Risk" ? "medium" : "low"}
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAction(approval.id)}
                    className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(approval.id)}
                    className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(approval.id)}
                    className="rounded-3xl bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-200"
                  >
                    Escalate
                  </button>
                </div>

                <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-950">Requested at</p>
                  <p className="mt-1">{approval.requestedAt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
