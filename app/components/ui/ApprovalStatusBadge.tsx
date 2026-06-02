import React from "react";
import { Badge } from "@/app/components/ui/Badge";
import { Clock, CheckCircle2, XCircle, AlertOctagon } from "lucide-react";
import type { ApprovalStatus } from "./types";

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  switch (status) {
    case "Approved":
      return <Badge variant="success" icon={CheckCircle2}>Approved</Badge>;
    case "Rejected":
      return <Badge variant="critical" icon={XCircle}>Rejected</Badge>;
    case "Escalated":
      return <Badge variant="info" icon={AlertOctagon}>Escalated</Badge>;
    case "Pending":
    default:
      return <Badge variant="warning" icon={Clock}>Pending</Badge>;
  }
}