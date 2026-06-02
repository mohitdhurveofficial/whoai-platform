import React from "react";
import { MetricCard } from "@/app/components/ui/MetricCard";
import { FileText, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

export function PolicyMetrics() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCard label="Total Policies" value="48" detail="Across all departments" icon={FileText} trend="neutral" />
      <MetricCard label="Active Policies" value="39" detail="Currently enforced" icon={CheckCircle2} trend="positive" />
      <MetricCard label="Pending Review" value="6" detail="Awaiting compliance check" icon={Clock} trend="neutral" />
      <MetricCard label="Critical Risk Policies" value="12" detail="High impact rules" icon={ShieldAlert} trend="negative" />
    </div>
  );
}