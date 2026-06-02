import React from "react";
import { MetricCard } from "@/app/components/ui/MetricCard";
import { OctagonAlert, ShieldAlert, Activity, TrendingUp } from "lucide-react";
import { RiskEvent } from "./types";

export function RiskMetrics({ data }: { data: RiskEvent[] }) {
  const openEvents = data.filter(d => d.status === "Open" || d.status === "Investigating").length;
  const criticalRisks = data.filter(d => d.severity === "Critical").length;
  const avgScore = data.length > 0 ? Math.round(data.reduce((acc, d) => acc + d.score, 0) / data.length) : 0;
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCard label="Open Risk Events" value={openEvents} detail="Active escalations" icon={Activity} trend="neutral" />
      <MetricCard label="Critical Risks" value={criticalRisks} detail="Requires immediate action" icon={OctagonAlert} trend="negative" />
      <MetricCard label="Policy Violations" value={12} detail="Last 24 hours" icon={ShieldAlert} trend="negative" />
      <MetricCard label="Average Risk Score" value={avgScore} detail="Across all decisions" icon={TrendingUp} trend="positive" />
    </div>
  );
}