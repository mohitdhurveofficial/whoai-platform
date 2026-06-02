import React from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import type { ExtendedApproval } from "./types";

interface ApprovalTableProps {
  data: ExtendedApproval[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewDetails: (approval: ExtendedApproval) => void;
}

export function ApprovalTable({ data, selectedIds, onToggleSelect, onViewDetails }: ApprovalTableProps) {
  return (
    <DataTable
      data={data}
      keyExtractor={(item) => item.id}
      columns={[
        {
          header: " ",
          className: "w-12 text-center",
          cell: (item) => (
            <input
              type="checkbox"
              checked={selectedIds.has(item.id)}
              onChange={() => onToggleSelect(item.id)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800"
            />
          ),
        },
        {
          header: "Request",
          cell: (item) => (
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{item.request}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.id} • {item.agent}</p>
            </div>
          ),
        },
        {
          header: "Risk",
          cell: (item) => {
            const isHigh = item.risk === "High Risk";
            const isMedium = item.risk === "Medium Risk";
            return (
              <Badge variant={isHigh ? "critical" : isMedium ? "warning" : "success"} showDot>
                {item.risk}
              </Badge>
            );
          },
        },
        {
          header: "Status",
          cell: (item) => <ApprovalStatusBadge status={item.status ?? "Pending"} />,
        },
        {
          header: "SLA",
          cell: (item) => (
            <span className={`text-sm ${(item.sla ?? "").includes("m") ? "text-rose-600 dark:text-rose-400 font-medium" : "text-slate-600 dark:text-slate-400"}`}>
              {item.sla ?? "N/A"}
            </span>
          ),
        },
        {
          header: "Actions",
          className: "text-right",
          cell: (item) => (
            <Button variant="ghost" onClick={() => onViewDetails(item)}>
              Review
            </Button>
          ),
        },
      ]}
    />
  );
}
