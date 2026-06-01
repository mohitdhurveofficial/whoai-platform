"use client";

import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Zap } from "lucide-react";

const decisionTrendData = [
  { date: "May 25", decisions: 245, approved: 198, rejected: 47 },
  { date: "May 26", decisions: 312, approved: 281, rejected: 31 },
  { date: "May 27", decisions: 289, approved: 242, rejected: 47 },
  { date: "May 28", decisions: 401, approved: 368, rejected: 33 },
  { date: "May 29", decisions: 356, approved: 301, rejected: 55 },
  { date: "May 30", decisions: 423, approved: 387, rejected: 36 },
  { date: "May 31", decisions: 512, approved: 472, rejected: 40 },
];

const riskDistribution = [
  { name: "Low Risk", value: 156, color: "#10b981" },
  { name: "Medium Risk", value: 289, color: "#f59e0b" },
  { name: "High Risk", value: 98, color: "#ef4444" },
];

const workerActivityData = [
  { name: "Payments", decisions: 234, approvals: 45, policies: 12 },
  { name: "Data Privacy", decisions: 156, approvals: 89, policies: 23 },
  { name: "Support Bot", decisions: 412, approvals: 3, policies: 2 },
  { name: "Analytics", decisions: 189, approvals: 12, policies: 5 },
  { name: "HR Assistant", decisions: 78, approvals: 34, policies: 8 },
];

const complianceMetrics = [
  { label: "Decision Audit Coverage", value: "100%", status: "excellent" },
  { label: "Policy Adherence Rate", value: "98.5%", status: "excellent" },
  { label: "Approval SLA Met", value: "96.2%", status: "good" },
  { label: "Data Retention Compliance", value: "100%", status: "excellent" },
];

export default function AnalyticsPage() {
  const totalDecisions = decisionTrendData.reduce((sum, d) => sum + d.decisions, 0);
  const avgApprovalRate = Math.round(
    decisionTrendData.reduce((sum, d) => sum + (d.approved / d.decisions), 0) / decisionTrendData.length * 100
  );
  const highRiskCount = riskDistribution.find((r) => r.name === "High Risk")?.value || 0;

  return (
    <AppShell
      title="Analytics"
      description="OS-level insights into AI worker activity, decision intelligence, and compliance metrics."
    >
      <PageHeader
        title="Analytics & Insights"
        description="Real-time operational intelligence across your autonomous AI workforce."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Decisions (7d)</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{totalDecisions.toLocaleString()}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <TrendingUp className="h-3 w-3" /> +18% vs last week
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Approval Rate</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{avgApprovalRate}%</p>
              <p className="mt-2 text-xs text-slate-600">Decisions auto-approved</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">High Risk Decisions</p>
              <p className="mt-3 text-3xl font-semibold text-rose-600">{highRiskCount}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                <AlertTriangle className="h-3 w-3" /> Needs review
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Workers</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">12</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                <Zap className="h-3 w-3" /> All operational
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Trends */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Trends</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Decision Volume & Outcomes</h2>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={decisionTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Line type="monotone" dataKey="decisions" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: "#0ea5e9", r: 4 }} />
            <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
            <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Distribution</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Decision Risk Levels</h2>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={riskDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        {/* Worker Activity */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Activity</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Top Workers by Decision Volume</h2>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={workerActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <Legend />
              <Bar dataKey="decisions" fill="#0ea5e9" />
              <Bar dataKey="approvals" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Compliance Scorecard */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Compliance</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Compliance Scorecard</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {complianceMetrics.map((metric, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">{metric.label}</p>
              <p className="text-2xl font-semibold text-slate-950">{metric.value}</p>
              <div className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                ✓ {metric.status === "excellent" ? "Excellent" : "Good"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
