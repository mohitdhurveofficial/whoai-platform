import React from "react";
import { ShieldCheck, Clock, ShieldX, AlertTriangle, PlayCircle } from "lucide-react";
import type { FirewallStatus } from "./types";

export function FirewallStatusBadge({ status }: { status: FirewallStatus }) {
  let colorClass = "";
  let Icon = ShieldCheck;

  switch (status) {
    case "Allowed":
    case "Executed":
      colorClass = "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20";
      Icon = status === "Executed" ? PlayCircle : ShieldCheck;
      break;
    case "Blocked":
    case "Violation":
      colorClass = "bg-rose-50 text-rose-800 ring-1 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20";
      Icon = ShieldX;
      break;
    case "Pending Approval":
    case "Escalated":
      colorClass = "bg-amber-50 text-amber-800 ring-1 ring-amber-200/70 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20";
      Icon = status === "Pending Approval" ? Clock : AlertTriangle;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold leading-none ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}
