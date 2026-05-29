"use client";

import {
  CheckCircle2,
  Clock3,
  Gauge,
  ShieldAlert,
  TimerReset,
  XCircle,
} from "lucide-react";
import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from "recharts";
import ApprovalTable from "../components/ApprovalTable";
import RiskBadge from "../components/RiskBadge";
import StatCard from "../components/StatCard";
import { approvals, metrics } from "@/lib/mockData";

export default function ApprovalsPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <section className="rounded-[32px] border border-black/5 bg-white/72 p-5 shadow-[0_24px_80px_rgba(7,17,38,0.07)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700 ring-1 ring-orange-100">
                <Clock3 size={16} />
                Human-in-the-loop
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Approval Center
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-500">
                Review high-impact AI actions before they touch production
                systems, customer data, or external payments.
              </p>
            </div>

            <div className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
              {metrics.pending} open requests
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Pending"
              value={metrics.pending}
              detail="Awaiting reviewer action"
              icon={ShieldAlert}
              tone="orange"
            />
            <StatCard
              title="Approved Today"
              value={metrics.approvedToday}
              detail="Cleared through policy review"
              icon={CheckCircle2}
              tone="green"
            />
            <StatCard
              title="Rejected Today"
              value={metrics.rejectedToday}
              detail="Blocked by reviewer decision"
              icon={XCircle}
              tone="red"
            />
            <StatCard
              title="Average Review Time"
              value={metrics.averageReviewTime}
              detail="Median response across queues"
              icon={TimerReset}
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
            <ApprovalTable approvals={approvals} />

            <aside className="space-y-6">
              <div className="rounded-[24px] border border-black/5 bg-white/82 p-6 shadow-[0_18px_50px_rgba(7,17,38,0.055)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black tracking-[-0.04em]">
                      Risk Summary
                    </h2>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                      Open approval requests grouped by evaluated risk level.
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Gauge size={20} />
                  </div>
                </div>

                <div className="mt-6">
                  <BarChart
                    width={300}
                    height={190}
                    data={metrics.riskSummary}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 18, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={132}
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    />
                    <Tooltip cursor={{ fill: "rgba(15, 23, 42, 0.04)" }} />
                    <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={18}>
                      {metrics.riskSummary.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-red-50/70 px-4 py-3">
                    <RiskBadge risk="High Risk" />
                    <span className="font-black text-slate-950">12</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-amber-50/70 px-4 py-3">
                    <RiskBadge risk="Medium Risk" />
                    <span className="font-black text-slate-950">21</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50/70 px-4 py-3">
                    <RiskBadge risk="Low Risk" />
                    <span className="font-black text-slate-950">9</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-black/5 bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(7,17,38,0.12)]">
                <p className="text-sm font-semibold text-white/55">
                  Review policy
                </p>
                <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                  Escalate every critical action before execution.
                </h3>
                <p className="mt-4 text-sm font-medium leading-6 text-white/60">
                  High-risk approvals remain blocked until a human reviewer
                  approves or rejects the request.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
