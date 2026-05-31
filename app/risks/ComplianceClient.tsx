"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { KpiCard } from "@/app/components/ui/KpiCard";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { DataTable, type DataTableProps } from "@/app/components/ui/DataTable";
import { Button } from "@/app/components/ui/Button";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { ShieldCheck, FileCheck, AlertTriangle, Activity } from "lucide-react";

type Framework = {
  id: string;
  name: string;
  score: number;
  passing: number;
  failing: number;
  findings: number;
  risk: string;
};

const mockFrameworks: Framework[] = [
  { id: "SOC2", name: "SOC 2 Type II", score: 94, passing: 112, failing: 3, findings: 2, risk: "low" },
  { id: "ISO27001", name: "ISO 27001", score: 88, passing: 94, failing: 8, findings: 5, risk: "medium" },
  { id: "EU_AI", name: "EU AI Act", score: 72, passing: 45, failing: 18, findings: 12, risk: "high" },
  { id: "NIST", name: "NIST AI RMF", score: 98, passing: 86, failing: 1, findings: 0, risk: "low" }
];

export function ComplianceClient() {
  const [frameworks] = useState<Framework[]>(mockFrameworks);
  const [isScanning, setIsScanning] = useState(false);

  const columns: DataTableProps<Framework>["columns"] = [
    { header: "Framework", cell: (item) => <span className="font-bold text-slate-900 dark:text-white">{item.name}</span> },
    { header: "Readiness Score", cell: (item) => <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{item.score}%</span> },
    { header: "Controls", cell: (item) => (
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {item.passing} Pass / <span className={item.failing > 0 ? "text-rose-500" : "text-slate-500"}>{item.failing} Fail</span>
        </span>
      ) 
    },
    { header: "Open Findings", cell: (item) => (
        <span className={`font-bold ${item.findings > 0 ? "text-amber-500" : "text-slate-500"}`}>{item.findings}</span>
      ) 
    },
    { header: "Risk Level", cell: (item) => <StatusBadge label={item.risk.toUpperCase()} variant={item.risk as "low" | "medium" | "high"} /> },
    { header: "Actions", className: "text-right", cell: (item) => <Button variant="ghost" onClick={() => alert(`Opening Full Audit View for ${item.name}...`)}>Audit View</Button> }
  ];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("Enterprise Gap Analysis Complete. 0 new high-risk findings detected.");
    }, 2000);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20 p-6 md:p-10">
      <PageHeader 
        title="Compliance Center" 
        description="Track AI governance posture against global regulatory frameworks."
        actions={<Button variant="primary" icon={ShieldCheck} onClick={handleScan}>
          {isScanning ? "Scanning Environment..." : "Run Gap Analysis"}
        </Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Global Audit Readiness" value="88%" icon={ShieldCheck} trend="up" trendValue="+4% this quarter" />
        <KpiCard title="Active Frameworks" value={4} icon={FileCheck} trend="neutral" trendValue="Enforced" />
        <KpiCard title="Control Violations" value={30} icon={AlertTriangle} trend="down" trendValue="Needs remediation" />
        <KpiCard title="Continuous Monitoring" value="Active" icon={Activity} trend="up" trendValue="Real-time" />
      </div>

      <SectionCard title="Regulatory Frameworks">
        <p className="text-sm text-slate-500 mb-4">
          Mapping automated decisions and policies to recognized compliance controls.
        </p>
        <DataTable 
          columns={columns} 
          data={frameworks} 
          keyExtractor={(item) => item.id} 
        />
      </SectionCard>
    </div>
  );
}