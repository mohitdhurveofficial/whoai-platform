import React from "react";
import { MetricCard } from "@/app/components/ui/MetricCard";
import { Users, Activity, CirclePause, TriangleAlert, DollarSign, Network } from "lucide-react";
import { AIWorker } from "./types";

export function RegistryMetrics({ data }: { data: AIWorker[] }) {
  const total = data.length;
  const active = data.filter(d => d.status === "Active").length;
  const paused = data.filter(d => d.status === "Paused").length;
  const highRisk = data.filter(d => d.riskLevel === "High" || d.riskLevel === "Critical").length;
  const totalCost = data.reduce((acc, d) => acc + d.monthlyCost, 0);
  const platforms = new Set(data.map(d => d.platform)).size;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      <MetricCard label="Total Workers" value={total} detail="Enrolled" icon={Users} trend="neutral" />
      <MetricCard label="Active Workers" value={active} detail="Executing" icon={Activity} trend="positive" />
      <MetricCard label="Paused Workers" value={paused} detail="Awaiting review" icon={CirclePause} trend="neutral" />
      <MetricCard label="High Risk" value={highRisk} detail="Attention needed" icon={TriangleAlert} trend="negative" />
      <MetricCard label="Monthly Cost" value={`$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} detail="Total compute" icon={DollarSign} trend="neutral" />
      <MetricCard label="Platforms" value={platforms} detail="Connected models" icon={Network} trend="positive" />
    </div>
  );
}