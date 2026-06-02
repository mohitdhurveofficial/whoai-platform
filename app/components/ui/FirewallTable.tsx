import React from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { FirewallStatusBadge } from "./FirewallStatusBadge";
import type { FirewallDecision } from "./types";

interface FirewallTableProps {
  data: FirewallDecision[];
  onViewDetails: (decision: FirewallDecision) => void;
}

export function FirewallTable({ data, onViewDetails }: FirewallTableProps) {
  return (
    <DataTable<FirewallDecision>
      data={data}
      keyExtractor={(item) => item.id}
      columns={[
        {
          header: "Decision ID",
          cell: (item: FirewallDecision) => (
            <div>
              <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">{item.id}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(item.createdAt).toLocaleTimeString()}</p>
            </div>
          ),
        },
        {
          header: "Worker & Action",
          cell: (item: FirewallDecision) => (
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.workerName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">{item.action}</p>
            </div>
          ),
        },
        {
          header: "Department",
          cell: (item: FirewallDecision) => <span className="text-sm text-slate-700 dark:text-slate-300">{item.department}</span>,
        },
        {
          header: "Risk",
          cell: (item: FirewallDecision) => {
            const isCritical = item.riskLevel === "Critical";
            const isHigh = item.riskLevel === "High";
            return (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.riskScore}</span>
              </div>
            );
          },
        },
        {
          header: "Firewall Status",
          cell: (item: FirewallDecision) => <FirewallStatusBadge status={item.firewallStatus} />,
        },
        {
          header: "",
          className: "text-right",
          cell: (item: FirewallDecision) => (
            <Button variant="ghost" onClick={() => onViewDetails(item)}>
              Inspect
            </Button>
          ),
        },
      ]}
    />
  );
}
