import React from "react";
import { MetricCard } from "@/app/components/ui/MetricCard";
import { Users, UserX, ShieldAlert, Key, TriangleAlert, Fingerprint } from "lucide-react";
import { AIIdentity } from "./types";

export function IdentityMetrics({ data }: { data: AIIdentity[] }) {
  const total = data.length;
  const active = data.filter(d => d.status === "Active").length;
  const orphaned = data.filter(d => d.status === "Orphaned").length;
  const expiringCreds = data.reduce((acc, curr) => acc + curr.credentials.filter(c => c.status === "Expiring Soon").length, 0);
  const highRisk = data.filter(d => d.riskLevel === "High" || d.riskLevel === "Critical").length;
  const violations = data.reduce((acc, curr) => acc + curr.policies.filter(p => p.status === "Violation").length, 0);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      <MetricCard label="Total Identities" value={total} detail="Managed workers" icon={Users} trend="neutral" />
      <MetricCard label="Active Identities" value={active} detail="Currently running" icon={Fingerprint} trend="positive" />
      <MetricCard label="Orphaned Workers" value={orphaned} detail="Missing owners" icon={UserX} trend="negative" />
      <MetricCard label="Expiring Credentials" value={expiringCreds} detail="Action required" icon={Key} trend="neutral" />
      <MetricCard label="High-Risk Workers" value={highRisk} detail="Score > 80" icon={ShieldAlert} trend="negative" />
      <MetricCard label="Policy Violations" value={violations} detail="Active breaches" icon={TriangleAlert} trend="negative" />
    </div>
  );
}