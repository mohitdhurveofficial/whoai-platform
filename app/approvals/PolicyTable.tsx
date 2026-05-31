import React from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { PolicyStatusBadge } from "./PolicyStatusBadge";
import type { ExtendedPolicy } from "./types";

interface PolicyTableProps {
  data: ExtendedPolicy[];
  onViewDetails: (policy: ExtendedPolicy) => void;
}

export function PolicyTable({ data, onViewDetails }: PolicyTableProps) {
  return (
    <DataTable
      data={data}
      keyExtractor={(item) => item.id}
      columns={[
        {
          header: "Policy Name",
          cell: (item) => (
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.id} • {item.version}</p>
            </div>
          ),
        },
        {
          header: "Department / Owner",
          cell: (item) => (
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{item.department}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.owner}</p>
            </div>
          ),
        },
        {
          header: "Risk Level",
          cell: (item) => {
            const isCritical = item.riskLevel === "Critical";
            const isHigh = item.riskLevel === "High";
            return (
              <Badge variant={isCritical ? "critical" : isHigh ? "warning" : "success"} showDot>
                {item.riskLevel}
              </Badge>
            );
          },
        },
        {
          header: "Status",
          cell: (item) => <PolicyStatusBadge status={item.status} />,
        },
        {
          header: "Workers",
          cell: (item) => <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.assignedWorkers}</span>,
        },
        {
          header: "Actions",
          className: "text-right",
          cell: (item) => (
            <Button variant="ghost" onClick={() => onViewDetails(item)}>
              Manage
            </Button>
          ),
        },
      ]}
    />
  );
}