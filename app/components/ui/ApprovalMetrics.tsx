import React from "react";
import { MetricCard } from "@/app/components/ui/MetricCard";
import { Clock, CheckCircle2, AlertTriangle, Inbox } from "lucide-react";

export function ApprovalMetrics() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCard label="Pending Approvals" value="14" detail="Awaiting manual review" icon={Inbox} trend="neutral" />
      <MetricCard label="Approvals Today" value="89" detail="Processed this session" icon={CheckCircle2} trend="positive" />
      <MetricCard label="Avg SLA Time" value="14m" detail="Time to resolution" icon={Clock} trend="positive" />
      <MetricCard label="Escalations" value="3" detail="Required executive review" icon={AlertTriangle} trend="negative" />
    </div>
  );
}