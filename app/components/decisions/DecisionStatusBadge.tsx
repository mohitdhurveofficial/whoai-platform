import React from "react";
import { DecisionStatus } from "./types";
import { Badge } from "@/app/components/ui/Badge";

export default function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  const variantMap: Record<DecisionStatus, "success" | "warning" | "critical" | "info"> = {
    Approved: "success",
    Pending: "warning",
    Rejected: "critical",
    Escalated: "info",
  };

  return (
    <Badge variant={variantMap[status]} showDot>
      {status}
    </Badge>
  );
}