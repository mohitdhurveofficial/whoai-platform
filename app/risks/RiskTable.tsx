import React from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { RiskSeverityBadge, RiskStatusBadge } from "./RiskStatusBadge";
import type { RiskEvent } from "./types";

interface RiskTableProps {
  data: RiskEvent[];
  onViewDetails: (event: RiskEvent) => void;
}

export function RiskTable({ data, onViewDetails }: RiskTableProps) {
  return (
    <DataTable<RiskEvent & Record<string, unknown>>
      data={data as (RiskEvent & Record<string, unknown>)[]}
      keyExtractor={(item) => item.id}
      columns={[
        {
          header: "Risk ID",
          cell: (item) => (
            <div>
              <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">{item.id}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          ),
        },
        {
          header: "Worker & Type",
          cell: (item) => (
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.workerName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">{item.riskType}</p>
            </div>
          ),
        },
        {
          header: "Department",
          cell: (item) => <span className="text-sm text-slate-700 dark:text-slate-300">{item.department}</span>,
        },
        {
          header: "Severity",
          cell: (item) => <RiskSeverityBadge severity={item.severity} />,
        },
        {
          header: "Score",
          cell: (item) => <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.score}</span>,
        },
        {
          header: "Status",
          cell: (item) => <RiskStatusBadge status={item.status} />,
        },
        {
          header: "",
          className: "text-right",
          cell: (item) => <Button variant="ghost" onClick={() => onViewDetails(item)}>Review</Button>,
        },
      ]}
    />
  );
}