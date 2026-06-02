import React from "react";
import { Fingerprint, Moon, Ghost, Archive } from "lucide-react";
import type { IdentityStatus } from "./types";

export function IdentityStatusBadge({ status }: { status: IdentityStatus }) {
  let colorClass = "";
  let Icon = Fingerprint;

  switch (status) {
    case "Active": colorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"; Icon = Fingerprint; break;
    case "Dormant": colorClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"; Icon = Moon; break;
    case "Shadow": colorClass = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"; Icon = Ghost; break;
    case "Archived": colorClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"; Icon = Archive; break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}