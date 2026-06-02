import React from "react";
import { Activity, CirclePause, Archive, CircleAlert, CirclePlay } from "lucide-react";
import type { WorkerStatus } from "./types";

export function RegistryStatusBadge({ status }: { status: WorkerStatus }) {
  let colorClass = "";
  let Icon = CirclePlay;

  switch (status) {
    case "Active":
      colorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      Icon = Activity;
      break;
    case "Paused":
    case "Dormant":
    case "Maintenance":
      colorClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      Icon = CirclePause;
      break;
    case "Archived":
      colorClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
      Icon = Archive;
      break;
    case "Error":
      colorClass = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      Icon = CircleAlert;
      break;
    case "Deploying":
      colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      Icon = CirclePlay;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}
