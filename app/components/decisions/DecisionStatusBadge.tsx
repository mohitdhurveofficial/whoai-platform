import React from "react";
import { DecisionStatus } from "./types";

export default function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  const styles = {
    Approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    Rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
    Escalated: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  };

  const dots = {
    Approved: "bg-emerald-500",
    Pending: "bg-amber-500",
    Rejected: "bg-rose-500",
    Escalated: "bg-violet-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`}></span>
      {status}
    </span>
  );
}