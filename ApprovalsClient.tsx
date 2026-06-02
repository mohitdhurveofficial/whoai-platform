"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileClock,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Eye,
  X,
  Activity,
  ChevronRight,
  Filter
} from "lucide-react";
import { updateApprovalStatus } from "@/lib/actions/approvals";
import { KpiCard } from "@/app/components/ui/KpiCard";
import { RiskBadge } from "@/app/components/ui/RiskBadge";
import { StatusBadge } from "@/app/components/ui/StatusBadge";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type RiskLevel = "low" | "medium" | "high";

export interface ApprovalData {
  id: number | string;
  agent_id: string | number;
  action_type: string;
  status: ApprovalStatus;
  created_at: string;
  risk_level: RiskLevel;
  policy_impact: string;
  reviewer: string;
}

export default function ApprovalsClient({ initialApprovals }: { initialApprovals: ApprovalData[] }) {
  const [mounted, setMounted] = useState(false);
  const [approvals, setApprovals] = useState<ApprovalData[]>(initialApprovals);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "all">("all");

  const [selectedApproval, setSelectedApproval] = useState<ApprovalData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length;
  const avgTime = "12m 34s"; 

  const filteredApprovals = useMemo(() => {
    return approvals.filter((app) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        String(app.id).toLowerCase().includes(searchLower) ||
        String(app.agent_id).toLowerCase().includes(searchLower) ||
        app.action_type.toLowerCase().includes(searchLower) ||
        app.policy_impact.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [approvals, search, statusFilter]);

  const openDrawer = useCallback((approval: ApprovalData) => {
    setSelectedApproval(approval);
    setIsDrawerOpen(true);
  }, []);

  const handleAction = useCallback(async (newStatus: "approved" | "rejected") => {
    if (!selectedApproval) return;
    setIsUpdating(true);
    
    try {
      setApprovals((prev) =>
        prev.map((app) =>
          app.id === selectedApproval.id
            ? { ...app, status: newStatus, reviewer: "System Admin" }
            : app
        )
      );
      
      await updateApprovalStatus(String(selectedApproval.id), newStatus.toUpperCase() as "APPROVED" | "REJECTED");
      
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Failed to update approval", error);
      setApprovals(initialApprovals);
    } finally {
      setIsUpdating(false);
    }
  }, [selectedApproval, initialApprovals]);

  return (
    <div className="flex-1 w-full min-h-screen pb-20">
      <main className="p-6 md:p-10 max-w-[1440px] mx-auto space-y-8">
        <div>
          <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-slate-900">
            Approval Center
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-[15px]">
            Review and manage high-risk autonomous AI decisions with enterprise guardrails.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Pending Approvals" value={pendingCount} icon={FileClock} />
          <KpiCard title="Approved Today" value={approvedCount} icon={CheckCircle2} />
          <KpiCard title="Rejected Today" value={rejectedCount} icon={XCircle} />
          <KpiCard title="Avg Review Time" value={avgTime} icon={Clock} />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-black/5 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID, Agent, or Action..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl border-none ring-1 ring-black/5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 transition-shadow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-full md:w-auto overflow-x-auto">
            <div className="pl-3 pr-2 text-slate-400 hidden sm:block">
              <Filter size={16} />
            </div>
            {(["all", "pending", "approved", "rejected"] satisfies Array<ApprovalStatus | "all">).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2 rounded-xl text-[13px] font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table Area */}
        <div className="premium-panel glass rounded-[32px] overflow-hidden shadow-premium">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-slate-50/50">
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Approval ID</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Agent</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Decision</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Risk Level</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Policy Impact</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Created</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Reviewer</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500 font-medium bg-white/20">
                      No approvals match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((app) => (
                    <tr key={app.id} className="transition-colors hover:bg-slate-50/50 group bg-white/40">
                      <td className="px-6 py-4">
                        <span className="font-mono text-[13px] font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                          {String(app.id).substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                            {String(app.agent_id).substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-[14px] text-slate-900">
                            {app.agent_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[14px] text-slate-700">
                          {app.action_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={app.risk_level === 'high' ? 'High' : app.risk_level === 'medium' ? 'Medium' : 'Low'} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[13px] text-slate-600">
                          {app.policy_impact}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const label = app.status === 'pending' ? 'Pending' : app.status === 'approved' ? 'Approved' : 'Rejected';
                          const variant = (label.toLowerCase() === 'approved' ? 'approved' : label.toLowerCase() === 'rejected' ? 'rejected' : 'pending') as "approved" | "pending" | "rejected";
                          return <StatusBadge label={label} variant={variant} />;
                        })()}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                        {mounted
                          ? new Date(app.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "..."}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-slate-600">
                        {app.reviewer}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDrawer(app)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                            title="View Audit"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openDrawer(app)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                              app.status === "pending"
                                ? "bg-orange-500 text-white shadow-button-orange hover:bg-orange-600 hover:-translate-y-0.5"
                                : "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm hover:bg-slate-50 hover:-translate-y-0.5"
                            }`}
                          >
                            {app.status === "pending" ? "Review" : "Details"}
                            <ChevronRight size={14} className="opacity-70" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Review Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && selectedApproval && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUpdating && setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] bg-white shadow-premium z-50 flex flex-col border-l border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Approval Request</h2>
                  <p className="text-[13px] font-bold font-mono text-slate-500 mt-1">ID: {selectedApproval.id}</p>
                </div>
                <button
                  onClick={() => !isUpdating && setIsDrawerOpen(false)}
                  disabled={isUpdating}
                  className="p-2.5 rounded-full hover:bg-slate-200/50 transition-colors text-slate-400 hover:text-slate-700 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-8 bg-slate-50/30">
                {/* Agent Action Block */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Activity size={14} /> Action Details
                  </p>
                  <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center text-sm ring-1 ring-slate-200">
                           {String(selectedApproval.agent_id).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-slate-900">{selectedApproval.agent_id}</p>
                          <p className="text-[13px] font-semibold text-slate-500">
                            Requested {new Date(selectedApproval.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                        {(() => {
                          const label = selectedApproval.status === 'pending' ? 'Pending' : selectedApproval.status === 'approved' ? 'Approved' : 'Rejected';
                          const variant = (label.toLowerCase() === 'approved' ? 'approved' : label.toLowerCase() === 'rejected' ? 'rejected' : 'pending') as "approved" | "pending" | "rejected";
                          return <StatusBadge label={label} variant={variant} />;
                        })()}
                    </div>
                    <div className="p-4 bg-slate-900 rounded-xl text-emerald-400 font-mono text-[13px] leading-relaxed shadow-inner overflow-x-auto whitespace-pre-wrap">
                      <span className="text-slate-500 mr-2">$</span>
                      {selectedApproval.action_type}
                    </div>
                  </div>
                </div>

                {/* Risk & Policy Block */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} /> Risk & Compliance
                  </p>
                  <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-100 shadow-sm space-y-5">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[14px] font-bold text-slate-500">Risk Assessment</span>
                        <RiskBadge level={selectedApproval.risk_level === 'high' ? 'High' : selectedApproval.risk_level === 'medium' ? 'Medium' : 'Low'} />
                    </div>
                    <div className="h-px bg-slate-100 w-full" />
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[14px] font-bold text-slate-500">Policy Impact</span>
                      <span className="text-[14px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                        {selectedApproval.policy_impact}
                      </span>
                    </div>
                    {selectedApproval.reviewer !== "-" && (
                      <>
                        <div className="h-px bg-slate-100 w-full" />
                        <div className="flex justify-between items-center py-1">
                          <span className="text-[14px] font-bold text-slate-500">Reviewer</span>
                          <span className="text-[14px] font-bold text-slate-700">
                            {selectedApproval.reviewer}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Enterprise Approval Chain */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <FileClock size={14} /> Approval Chain & SLA
                  </p>
                  <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-100 shadow-sm">
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-slate-100">
                      <div className="relative flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shrink-0 z-10"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-900">Agent Proposal</span>
                          <span className="text-xs text-slate-500">Approved</span>
                        </div>
                      </div>
                      <div className="relative flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shrink-0 z-10"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-900">Compliance Check</span>
                          <span className="text-xs text-slate-500">Automated</span>
                        </div>
                      </div>
                      <div className="relative flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-4 border-white flex items-center justify-center shrink-0 z-10 ${selectedApproval.status === 'pending' ? 'bg-orange-500' : selectedApproval.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                          {selectedApproval.status === 'pending' ? <Clock className="w-3 h-3 text-white" /> : selectedApproval.status === 'approved' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-900">Security Officer</span>
                          <span className="text-xs font-semibold capitalize text-slate-500">{selectedApproval.status}</span>
                        </div>
                      </div>
                    </div>
                    {selectedApproval.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">SLA Deadline</span>
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">2h 15m remaining</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              {selectedApproval.status === "pending" && (
                <div className="p-6 border-t border-slate-100 bg-white flex gap-4">
                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={isUpdating}
                    className="flex-1 py-3.5 rounded-xl border border-red-200 text-red-600 bg-white text-[14px] font-black transition-all hover:bg-red-50 hover:border-red-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button
                    onClick={() => handleAction("approved")}
                    disabled={isUpdating}
                    className="flex-1 py-3.5 rounded-xl bg-orange-500 text-white text-[14px] font-black transition-all shadow-button-orange hover:bg-orange-600 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Approve
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
