import React from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { IdentityStatusBadge } from "./IdentityStatusBadge";
import type { WorkerIdentity } from "./types";

export function IdentityTable({ data, onViewDetails }: { data: WorkerIdentity[]; onViewDetails: (w: WorkerIdentity) => void }) {
  return (
    <DataTable<WorkerIdentity & Record<string, unknown>>
      data={data as (WorkerIdentity & Record<string, unknown>)[]}
      keyExtractor={w => w.id}
      columns={[
        {
          header: "Identity & Name",
          cell: w => (
            <div>
              <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">{w.id}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{w.name}</p>
            </div>
          )
        },
        {
          header: "Owner & Dept",
          cell: w => (
            <div>
              <p className={`text-sm font-semibold ${w.owner === "Unassigned" ? "text-rose-500" : "text-slate-900 dark:text-white"}`}>{w.owner}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{w.department}</p>
            </div>
          )
        },
        {
          header: "Risk Score",
          cell: w => {
            const c = w.riskScore >= 80 ? "bg-rose-500" : w.riskScore >= 50 ? "bg-amber-500" : "bg-emerald-500";
            return (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${c}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{w.riskScore}</span>
              </div>
            );
          }
        },
        { header: "Status", cell: w => <IdentityStatusBadge status={w.status} /> },
        { header: "Access Count", cell: w => <span className="text-sm text-slate-700 dark:text-slate-300">{w.connectedSystems.length} systems</span> },
        { header: "Last Activity", cell: w => <span className="text-sm text-slate-700 dark:text-slate-300">{w.lastActivity}</span> },
        {
          header: "", className: "text-right",
          cell: w => <Button variant="ghost" onClick={() => onViewDetails(w)}>Inspect</Button>
        }
      ]}
    />
  );
}