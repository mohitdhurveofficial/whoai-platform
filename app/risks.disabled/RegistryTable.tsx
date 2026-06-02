import React from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { RegistryStatusBadge } from "./RegistryStatusBadge";
import type { AIWorker } from "./types";

export function RegistryTable({ data, onViewDetails }: { data: AIWorker[]; onViewDetails: (w: AIWorker) => void }) {
  return (
    <DataTable
      data={data}
      keyExtractor={w => w.id}
      columns={[
        {
          header: "Worker ID",
          cell: w => <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">{w.id}</p>
        },
        {
          header: "Name & Dept",
          cell: w => (
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{w.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{w.department}</p>
            </div>
          )
        },
        { header: "Owner", cell: w => <span className="text-sm text-slate-700 dark:text-slate-300">{w.owner}</span> },
        { header: "Platform", cell: w => <span className="text-sm text-slate-700 dark:text-slate-300">{w.platform}</span> },
        {
          header: "Risk",
          cell: w => {
            const c = w.riskLevel === "Critical" ? "bg-rose-500" : w.riskLevel === "High" ? "bg-orange-500" : w.riskLevel === "Medium" ? "bg-amber-500" : "bg-emerald-500";
            return (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${c}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{w.riskScore}</span>
              </div>
            );
          }
        },
        { header: "Status", cell: w => <RegistryStatusBadge status={w.status} /> },
        { 
          header: "API Spend", 
          cell: w => <span className="text-sm font-mono text-slate-700 dark:text-slate-300">${w.monthlyCost?.toFixed(2) || "0.00"}</span> 
        },
        { 
          header: "Wallet Balance", 
          cell: w => <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">${(w as any).walletBalance?.toFixed(2) || "10.00"}</span> 
        },
        {
          header: "",
          className: "text-right",
          cell: w => <Button variant="ghost" onClick={() => onViewDetails(w)}>Inspect</Button>
        }
      ]}
    />
  );
}