"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { KpiCard } from "@/app/components/ui/KpiCard";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { DataTable, type DataTableProps } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { SearchBar } from "@/app/components/ui/SearchBar";
import { Database, Download, Lock } from "lucide-react";

type Evidence = {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  policy: string;
  framework: string;
  status: string;
};

const mockEvidence: Evidence[] = [
  { id: "EVD-9021A", timestamp: "2026-05-31T10:15:00Z", agent: "DataSync-Prod-01", action: "PII Detection Bypass Request", policy: "Data Exfiltration Block", framework: "SOC2-CC6.1", status: "Validated" },
  { id: "EVD-9022B", timestamp: "2026-05-31T09:44:12Z", agent: "EmailCampaign-Agent", action: "Unapproved IAM Role Assumption", policy: "Least Privilege Access", framework: "ISO-A.9.2.1", status: "Validated" },
  { id: "EVD-9023C", timestamp: "2026-05-31T08:10:05Z", agent: "CodeDeploy-Worker", action: "Production DB Write", policy: "Production Write Access", framework: "SOC2-CC8.1", status: "Pending" },
];

export function EvidenceClient() {
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const columns: DataTableProps<Evidence>["columns"] = [
    { header: "Evidence ID", cell: (item) => <span className="font-mono text-xs text-slate-500">{item.id}</span> },
    { header: "Timestamp", cell: (item) => <span className="text-sm font-medium text-slate-700">{new Date(item.timestamp).toLocaleString()}</span> },
    { header: "Agent / Actor", cell: (item) => <span className="font-semibold text-slate-900 dark:text-white">{item.agent}</span> },
    { header: "Trigger Action", accessorKey: "action" },
    { header: "Policy Enforced", accessorKey: "policy" },
    { header: "Control Mapping", cell: (item) => <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md">{item.framework}</span> },
    { header: "Status", cell: (item) => <StatusBadge label={item.status} variant={item.status === "Validated" ? "approved" : "pending"} /> },
    { header: "Export", className: "text-right", cell: (item) => <Button variant="ghost" icon={Download} onClick={() => alert(`Downloading cryptographic evidence package for ${item.id}...`)}>PDF</Button> }
  ];

  const handleExportAll = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Complete Vault Archive exported securely to your system downloads.");
    }, 1800);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20 p-6 md:p-10">
      <PageHeader 
        title="Evidence Vault" 
        description="Cryptographically secure log of compliance-relevant AI activities."
        actions={<Button variant="secondary" icon={Download} onClick={handleExportAll}>
          {isExporting ? "Compiling Archive..." : "Export Vault Archive"}
        </Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Evidence Captured" value="14,204" icon={Database} trend="up" trendValue="+1,200 this week" />
        <KpiCard title="Automated Mappings" value="99.8%" icon={Lock} trend="up" trendValue="SOC2 & ISO" />
        <KpiCard title="Missing Evidence" value="0" icon={Database} trend="neutral" trendValue="Fully compliant" />
      </div>

      <SectionCard title="Immutable Audit Records">
        <div className="mb-4 max-w-md">
          <SearchBar 
            placeholder="Search by Evidence ID, Agent, or Control..." 
            value={search} 
            onChange={setSearch} 
          />
        </div>
        <DataTable 
          columns={columns} 
          data={mockEvidence} 
          keyExtractor={(item) => item.id} 
        />
      </SectionCard>
    </div>
  );
}