import React from "react";
import type { FirewallDecision } from "./types";

export function ApprovalRoutingCard({ decision }: { decision: FirewallDecision }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <h3 className="text-sm font-semibold">Approval Routing</h3>
      <p className="text-sm text-slate-500 mt-2">
        Approval routing data not available for this decision schema.
      </p>
    </div>
  );
}