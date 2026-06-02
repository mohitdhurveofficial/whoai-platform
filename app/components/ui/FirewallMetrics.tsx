import React from "react";
import { MetricCard } from "@/app/components/ui/MetricCard";
import { ShieldAlert, ShieldCheck, Clock, ShieldX } from "lucide-react";
import { FirewallDecision } from "./types";

export function FirewallMetrics({ data }: { data: FirewallDecision[] }) {
  const blockedCount = data.filter(d => d.firewallStatus === "Blocked" || d.firewallStatus === "Violation").length;
  const pendingCount = data.filter(d => d.firewallStatus === "Pending Approval").length;
  const executedCount = data.filter(d => d.firewallStatus === "Executed").length;
  const criticalCount = data.filter(d => d.riskLevel === "Critical").length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCard label="Blocked Actions" value={blockedCount} detail="Intercepted today" icon={ShieldX} trend="positive" />
      <MetricCard label="Pending Approvals" value={pendingCount} detail="Requires review" icon={Clock} trend="neutral" />
      <MetricCard label="Executed Actions" value={executedCount} detail="Passed governance" icon={ShieldCheck} trend="positive" />
      <MetricCard label="Critical Risks" value={criticalCount} detail="High risk decisions" icon={ShieldAlert} trend="negative" />
    </div>
  );
}