"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { KpiCard } from "@/app/components/ui/KpiCard";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { DataTable, type DataTableProps } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { SearchBar } from "@/app/components/ui/SearchBar";
import { AlertTriangle, ShieldAlert, Clock, Target } from "lucide-react";

type Incident = {
  id: string;
  severity: string;
  status: string;
  owner: string;
  agent: string;
  rootCause: string;
  timeToResolve: string;
};

const mockIncidents: Incident[] = [
  { id: "INC-2026-081", severity: "critical", status: "Investigating", owner: "SecOps Team", agent: "DataSync-Prod-01", rootCause: "Rogue Agent Access Attempt", timeToResolve: "Active" },
  { id: "INC-2026-080", severity: "high", status: "Open", owner: "Compliance Team", agent: "EmailCampaign-Agent", rootCause: "SLA Breach on Approval", timeToResolve: "Active" },
  { id: "INC-2026-079", severity: "medium", status: "Resolved", owner: "Morgan Lee", agent: "CodeDeploy-Worker", rootCause: "Policy Misconfiguration", timeToResolve: "45m" },
];

export function IncidentsClient() {
  const [search, setSearch] = useState("");

  const columns: DataTableProps<Incident>["columns"] = [
    { header: "Incident ID", cell: (item) => <span className="font-mono font-bold text-slate-900 dark:text-white">{item.id}</span> },
    { header: "Severity", cell: (item) => <StatusBadge label={item.severity.toUpperCase()} variant={item.severity as any} /> },
    { header: "Status", cell: (item) => <span className={`font-semibold text-sm ${item.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</span> },
    { header: "Agent", accessorKey: "agent" },
    { header: "Root Cause", cell: (item) => <span className="text-sm font-medium text-slate-600">{item.rootCause}</span> },
    { header: "Owner", accessorKey: "owner" },
    { header: "TTR", accessorKey: "timeToResolve" },
    { header: "Actions", className: "text-right", cell: () => <Button variant="secondary">Manage</Button> }
  ];

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20 p-6 md:p-10">
      <PageHeader 
        title="Incident Management" 
        description="Track, investigate, and resolve AI governance breaches and high-risk alerts."
        actions={<Button variant="danger" icon={ShieldAlert}>Declare Incident</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard title="Open Incidents" value="2" icon={AlertTriangle} trend="down" trendValue="vs last week" />
        <KpiCard title="Critical Alerts" value="1" icon={ShieldAlert} trend="neutral" trendValue="Active" />
        <KpiCard title="Avg Resolution Time" value="45m" icon={Clock} trend="up" trendValue="Improving" />
        <KpiCard title="SLA Compliance" value="98%" icon={Target} trend="up" trendValue="Target: 99%" />
      </div>

      <SectionCard title="Active & Historical Incidents">
        <div className="mb-4 max-w-md">
          <SearchBar 
            placeholder="Search by ID, Agent, or Root Cause..." 
            value={search} 
            onChange={setSearch} 
          />
        </div>
        <DataTable 
          columns={columns} 
          data={mockIncidents} 
          keyExtractor={(item) => item.id} 
        />
      </SectionCard>
    </div>
  );
}