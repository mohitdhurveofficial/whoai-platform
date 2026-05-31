"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { DataTable, type DataTableProps } from "@/components/ui/DataTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlideOver } from "@/components/ui/SlideOver";
import { ListChecks, AlertTriangle, UserCheck, Activity, Eye, Download } from "lucide-react";

const FILTER_TABS = ["All", "Low Risk", "Medium Risk", "High Risk", "Critical Risk", "Needs Approval", "Approved", "Rejected"];

type DecisionLedgerItem = {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  riskScore: number;
  riskLevel: string;
  confidenceScore: number;
  status: string;
};

export default function DecisionsClient({ initialData }: { initialData: DecisionLedgerItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedDecision, setSelectedDecision] = useState<DecisionLedgerItem | null>(null);

  const highRiskCount = initialData.filter(d => d.riskScore >= 70).length;
  const reviewedCount = initialData.filter(d => d.status !== "PENDING").length;
  const reviewRate = initialData.length ? Math.round((reviewedCount / initialData.length) * 100) : 0;
  const avgConfidence = initialData.length ? Math.round(initialData.reduce((acc, d) => acc + d.confidenceScore, 0) / initialData.length) : 0;

  const filteredData = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();
    return initialData.filter((decision) => {
      const matchesSearch =
        decision.id.toLowerCase().includes(normalizedSearch) ||
        decision.action.toLowerCase().includes(normalizedSearch) ||
        decision.agentName.toLowerCase().includes(normalizedSearch);

      const matchesTab = 
        activeTab === "All" ||
        (activeTab === "Low Risk" && decision.riskLevel === "LOW") ||
        (activeTab === "Medium Risk" && decision.riskLevel === "MEDIUM") ||
        (activeTab === "High Risk" && decision.riskLevel === "HIGH") ||
        (activeTab === "Critical Risk" && decision.riskLevel === "CRITICAL") ||
        (activeTab === "Needs Approval" && decision.status === "PENDING") ||
        (activeTab === "Approved" && decision.status === "APPROVED") ||
        (activeTab === "Rejected" && decision.status === "REJECTED");

      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab, initialData]);

  const columns: DataTableProps<DecisionLedgerItem>["columns"] = [
    { header: "Decision ID", accessorKey: "id", cell: (item: DecisionLedgerItem) => <span className="font-mono text-xs text-slate-600">{item.id.substring(0,8)}</span> },
    { header: "Timestamp", accessorKey: "timestamp", cell: (item: DecisionLedgerItem) => <span className="text-slate-600">{new Date(item.timestamp).toLocaleString()}</span> },
    { header: "Agent", accessorKey: "agentName", cell: (item: DecisionLedgerItem) => <span className="font-medium text-slate-900">{item.agentName}</span> },
    { header: "Action", accessorKey: "action" },
    { header: "Risk Score", accessorKey: "riskScore", cell: (item: DecisionLedgerItem) => <RiskBadge level={item.riskLevel} /> },
    { header: "Confidence", accessorKey: "confidenceScore", cell: (item: DecisionLedgerItem) => <span className="text-slate-600">{item.confidenceScore}%</span> },
    { header: "Status", accessorKey: "status", cell: (item: DecisionLedgerItem) => <StatusBadge status={item.status} /> },
    { header: "", cell: (item: DecisionLedgerItem) => (
        <button onClick={() => setSelectedDecision(item)} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <Eye className="h-4 w-4" /> Review
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader title="Decision Intelligence" description="Immutable ledger of all AI worker decisions and actions." action={<button className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-all"><Download className="h-4 w-4" /> Export Ledger</button>} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Decisions Today" value={initialData.length} icon={ListChecks} />
        <KpiCard title="High Risk Decisions" value={highRiskCount} icon={AlertTriangle} trend={highRiskCount > 0 ? "up" : "neutral"} trendValue="Needs attention" />
        <KpiCard title="Human Reviewed %" value={`${reviewRate}%`} icon={UserCheck} />
        <KpiCard title="Avg Confidence Score" value={`${avgConfidence}%`} icon={Activity} />
      </div>

      <SectionCard title="Ledger Log">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SearchBar placeholder="Search decisions by ID, worker, or action..." onChange={setSearchQuery} />
            <div className="overflow-x-auto pb-2 sm:pb-0">
              <FilterTabs tabs={FILTER_TABS} activeTab={activeTab} onChange={setActiveTab} />
            </div>
          </div>
          <DataTable columns={columns} data={filteredData} keyExtractor={(item) => item.id} />
        </div>
      </SectionCard>

      <SlideOver isOpen={!!selectedDecision} onClose={() => setSelectedDecision(null)} title="Decision Review Details">
        {selectedDecision && (
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Decision Summary</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div><dt className="text-slate-500 mb-1">Decision ID</dt><dd className="font-mono text-slate-900 font-medium">{selectedDecision.id}</dd></div>
                <div><dt className="text-slate-500 mb-1">Timestamp</dt><dd className="text-slate-900">{new Date(selectedDecision.timestamp).toLocaleString()}</dd></div>
                <div className="sm:col-span-2"><dt className="text-slate-500 mb-1">Action</dt><dd className="text-slate-900 font-medium">{selectedDecision.action}</dd></div>
              </dl>
            </section>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
