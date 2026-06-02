"use client";

import React from "react";
import { tokens } from "@/app/components/ui/tokens";
import { Button } from "@/app/components/ui/Button";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { X, ShieldAlert, User, Clock } from "lucide-react";
import type { ExtendedApproval, ApprovalStatus } from "./types";

interface ApprovalDrawerProps {
  approval: ExtendedApproval | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ApprovalStatus) => void;
}

export function ApprovalDrawer({ approval, isOpen, onClose, onUpdateStatus }: ApprovalDrawerProps) {
  if (!isOpen || !approval) return null;

  const Icon = approval.icon;
  const status = approval.status ?? "Pending";

  return (
    <>
      <div className={tokens.layout.drawerOverlay} onClick={onClose} />
      <div className={tokens.layout.drawerContent}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Review Request</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              {Icon && <Icon className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">{approval.request}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{approval.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</p>
              <div className="mt-1.5"><ApprovalStatusBadge status={status} /></div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">SLA Timer</p>
              <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                {approval.sla}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Risk Level</p>
              <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className={`h-4 w-4 ${approval.risk === "High Risk" ? "text-rose-500" : "text-amber-500"}`} />
                {approval.risk}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Agent</p>
              <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                {approval.agent}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Context & Audit Trail</h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p><strong className="text-slate-900 dark:text-slate-200">Owner:</strong> {approval.owner}</p>
              <p><strong className="text-slate-900 dark:text-slate-200">Requested At:</strong> {approval.requestedAt}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Automated policy execution was blocked because the confidence score fell below the required threshold for this risk tier. Human review is strictly required before execution.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
          {status === "Pending" && (
            <>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={() => onUpdateStatus(approval.id, "Approved")}>Approve</Button>
                <Button variant="danger" className="flex-1" onClick={() => onUpdateStatus(approval.id, "Rejected")}>Reject</Button>
              </div>
              <Button variant="secondary" className="w-full" onClick={() => onUpdateStatus(approval.id, "Escalated")}>Escalate to Executive</Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
