import React from "react";
import { MetricCard } from "@/app/components/ui/MetricCard";
import { Users, Fingerprint, Moon, ShieldAlert, Ghost } from "lucide-react";
import { WorkerIdentity } from "./types";

export function IdentityMetrics({ data }: { data: WorkerIdentity[] }) {
  const total = data.length;
  const active = data.filter(d => d.status === "Active").length;
  const dormant = data.filter(d => d.status === "Dormant").length;
  const shadow = data.filter(d => d.status === "Shadow").length;
  const highRisk = data.filter(d => d.riskScore >= 80).length;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
      <MetricCard label="Total Identities" value={total} detail="Registered workers" icon={Users} trend="neutral" />
      <MetricCard label="Active Identities" value={active} detail="Currently running" icon={Fingerprint} trend="positive" />
      <MetricCard label="Dormant Workers" value={dormant} detail="Inactive > 90 days" icon={Moon} trend="neutral" />
      <MetricCard label="High-Risk Identities" value={highRisk} detail="Score > 80" icon={ShieldAlert} trend="negative" />
      <MetricCard label="Shadow Workers" value={shadow} detail="Unowned/Unregistered" icon={Ghost} trend="negative" />
    </div>
  );
}