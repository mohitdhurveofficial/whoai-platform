import React from "react";
import { Badge } from "@/app/components/ui/Badge";
import { CheckCircle2, Clock, FileEdit, Archive } from "lucide-react";
import type { PolicyStatus } from "./types";

export function PolicyStatusBadge({ status }: { status: PolicyStatus }) {
  switch (status) {
    case "Active":
      return <Badge variant="success" icon={CheckCircle2}>Active</Badge>;
    case "Review":
      return <Badge variant="warning" icon={Clock}>Review</Badge>;
    case "Draft":
      return <Badge variant="primary" icon={FileEdit}>Draft</Badge>;
    case "Archived":
      return <Badge variant="secondary" icon={Archive}>Archived</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}