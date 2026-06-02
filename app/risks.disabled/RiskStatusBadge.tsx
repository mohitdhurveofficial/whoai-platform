import React from "react";
import type { RiskSeverity, RiskStatus } from "./types";

export function RiskSeverityBadge({ severity }: { severity: RiskSeverity }) {
  let colorClass = "";
  switch (severity) {
    case "Critical": colorClass = "bg-rose-50 text-rose-800 ring-1 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20"; break;
    case "High": colorClass = "bg-orange-50 text-orange-800 ring-1 ring-orange-200/70 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-400/20"; break;
    case "Medium": colorClass = "bg-amber-50 text-amber-800 ring-1 ring-amber-200/70 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20"; break;
    case "Low": colorClass = "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20"; break;
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold leading-none ${colorClass}`}>
      {severity}
    </span>
  );
}

export function RiskStatusBadge({ status }: { status: RiskStatus }) {
  let colorClass = "";
  switch (status) {
    case "Open": colorClass = "bg-rose-50 text-rose-800 ring-1 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20"; break;
    case "Investigating": colorClass = "bg-blue-50 text-blue-800 ring-1 ring-blue-200/70 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/20"; break;
    case "Resolved": colorClass = "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20"; break;
    case "Ignored": colorClass = "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"; break;
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold leading-none ${colorClass}`}>
      {status}
    </span>
  );
}
