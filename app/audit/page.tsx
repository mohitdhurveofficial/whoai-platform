"use client";

import { useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Download, Filter, Search } from "lucide-react";

type AuditEvent = {
  id: string;
  timestamp: string;
  eventType: "AI_DECISION" | "AI_ACTION" | "POLICY_APPLIED" | "APPROVAL_REQUESTED" | "APPROVAL_GRANTED" | "PERMISSION_GRANTED" | "LOGIN";
  actor: string;
  resource: string;
  action: string;
  status: "SUCCESS" | "FAILED";
  details: string;
};

const MOCK_AUDIT_LOGS: AuditEvent[] = [
  {
    id: "audit-1",
    timestamp: "2026-05-31T14:32:00Z",
    eventType: "AI_DECISION",
    actor: "Payments Agent",
    resource: "PAYMENT_TRANSACTION",
    action: "EXECUTE",
    status: "SUCCESS",
    details: "Processed $5,000 payment with auto-approval",
  },
  {
    id: "audit-2",
    timestamp: "2026-05-31T14:28:15Z",
    eventType: "APPROVAL_GRANTED",
    actor: "Sarah Anderson",
    resource: "DISCOUNT_REQUEST",
    action: "APPROVE",
    status: "SUCCESS",
    details: "Approved 30% discount for enterprise customer",
  },
  {
    id: "audit-3",
    timestamp: "2026-05-31T14:15:42Z",
    eventType: "POLICY_APPLIED",
    actor: "Data Privacy Agent",
    resource: "CUSTOMER_DATA",
    action: "DELETE",
    status: "SUCCESS",
    details: "GDPR deletion policy enforced, customer data purged",
  },
  {
    id: "audit-4",
    timestamp: "2026-05-31T13:52:08Z",
    eventType: "PERMISSION_GRANTED",
    actor: "Security Team",
    resource: "PRODUCTION_DATABASE",
    action: "GRANT_ACCESS",
    status: "SUCCESS",
    details: "Granted read-only access to Infrastructure Agent",
  },
  {
    id: "audit-5",
    timestamp: "2026-05-31T13:21:30Z",
    eventType: "AI_ACTION",
    actor: "Support Bot",
    resource: "KNOWLEDGE_BASE",
    action: "UPDATE",
    status: "SUCCESS",
    details: "Updated 15 FAQ entries based on support tickets",
  },
  {
    id: "audit-6",
    timestamp: "2026-05-31T12:45:17Z",
    eventType: "LOGIN",
    actor: "Michael Chen",
    resource: "SYSTEM",
    action: "AUTHENTICATE",
    status: "SUCCESS",
    details: "User logged in from IP 192.168.1.100",
  },
];

const EVENT_TYPE_COLORS: Record<AuditEvent["eventType"], string> = {
  AI_DECISION: "bg-blue-100 text-blue-700",
  AI_ACTION: "bg-purple-100 text-purple-700",
  POLICY_APPLIED: "bg-amber-100 text-amber-700",
  APPROVAL_REQUESTED: "bg-sky-100 text-sky-700",
  APPROVAL_GRANTED: "bg-emerald-100 text-emerald-700",
  PERMISSION_GRANTED: "bg-indigo-100 text-indigo-700",
  LOGIN: "bg-slate-100 text-slate-700",
};

export default function AuditTrustPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEventType = eventTypeFilter === null || log.eventType === eventTypeFilter;
    const matchesStatus = statusFilter === null || log.status === statusFilter;

    return matchesSearch && matchesEventType && matchesStatus;
  });

  const getEventColor = (eventType: AuditEvent["eventType"]) => EVENT_TYPE_COLORS[eventType] || "bg-slate-100 text-slate-700";

  return (
    <AppShell
      title="Audit & Trust Center"
      description="Immutable audit trail and compliance reporting for all AI worker activities."
    >
      <PageHeader
        title="Audit & Trust Center"
        description="Complete transparency into all autonomous AI decisions, actions, and approvals."
      />

      {/* Compliance Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Events</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{MOCK_AUDIT_LOGS.length}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Success Rate</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">100%</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compliance Status</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 mr-2" />
            Compliant
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Retention</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">365 days</p>
        </div>
      </div>

      {/* Audit Logs */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Activity Log</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Immutable Audit Trail</h2>
          </div>
          <button className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actor, resource, or details..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Event Type</label>
            <select
              value={eventTypeFilter || ""}
              onChange={(e) => setEventTypeFilter(e.target.value || null)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              <option value="AI_DECISION">AI Decision</option>
              <option value="AI_ACTION">AI Action</option>
              <option value="POLICY_APPLIED">Policy Applied</option>
              <option value="APPROVAL_GRANTED">Approval Granted</option>
              <option value="PERMISSION_GRANTED">Permission Granted</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Event Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-600">
                    No audit events found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getEventColor(log.eventType)}`}>
                        {log.eventType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-950">{log.actor}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{log.resource}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={log.status} variant={log.status === "SUCCESS" ? "approved" : "rejected"} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compliance Report */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Compliance</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Regulatory Compliance</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">GDPR Compliance</p>
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-600">All data deletion requests logged and verified</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">SOC 2 Type II</p>
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-600">Complete audit trail maintained for 365+ days</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">ISO 27001</p>
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-600">Access controls and identity management enforced</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
