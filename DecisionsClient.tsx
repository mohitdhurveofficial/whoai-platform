"use client";

import { useMemo, useState, useCallback } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { KpiCard } from "@/app/components/ui/KpiCard";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { DataTable, type DataTableProps } from "@/app/components/ui/DataTable";
import { SearchBar } from "@/app/components/ui/SearchBar";
import { FilterTabs } from "@/app/components/ui/FilterTabs";
import { RiskBadge } from "@/app/components/ui/RiskBadge";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { SlideOver } from "@/app/components/ui/SlideOver";
import { ListChecks, AlertTriangle, UserCheck, Activity, Eye, Download, ShieldCheck, Users } from "lucide-react";

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
  const [isExporting, setIsExporting] = useState(false);

  const highRiskCount = initialData.filter(d => d.riskScore >= 70).length;

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

  const columns: DataTableProps<DecisionLedgerItem>["columns"] = useMemo(() => [
    { header: "Decision ID", accessorKey: "id", cell: (item: DecisionLedgerItem) => <span className="font-mono text-xs text-slate-600">{item.id.substring(0,8)}</span> },
    { header: "Timestamp", accessorKey: "timestamp", cell: (item: DecisionLedgerItem) => <span className="text-slate-600">{new Date(item.timestamp).toLocaleString()}</span> },
    { header: "Agent", accessorKey: "agentName", cell: (item: DecisionLedgerItem) => <span className="font-medium text-slate-900">{item.agentName}</span> },
    { header: "Action", accessorKey: "action" },
    { header: "Risk Score", accessorKey: "riskScore", cell: (item: DecisionLedgerItem) => {
        const level = item.riskLevel.charAt(0) + item.riskLevel.slice(1).toLowerCase();
        return <RiskBadge level={level as "Low" | "Medium" | "High" | "Critical"} />;
      } },
    { header: "Confidence", accessorKey: "confidenceScore", cell: (item: DecisionLedgerItem) => <span className="text-slate-600">{item.confidenceScore}%</span> },
    { header: "Status", accessorKey: "status", cell: (item: DecisionLedgerItem) => {
        const statusLabel = String(item.status);
        const variant = (statusLabel.toLowerCase() === 'approved' ? 'approved' : statusLabel.toLowerCase() === 'rejected' ? 'rejected' : 'pending') as "approved" | "pending" | "rejected";
        return <StatusBadge label={statusLabel} variant={variant} />
      }
    },
    { header: "", cell: (item: DecisionLedgerItem) => (
        <button onClick={() => setSelectedDecision(item)} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <Eye className="h-4 w-4" /> Review
        </button>
      )
    }
  ], []);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Immutable AI Ledger exported as CSV securely to your device.");
    }, 1500);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Decision Intelligence"
        description="Immutable ledger of all AI worker decisions and actions."
        actions={
          <button onClick={handleExport} className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-all">
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Ledger"}
          </button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KpiCard title="Decisions Today" value={initialData.length} icon={ListChecks} trend="up" trendValue="vs yesterday" />
        <KpiCard title="High-Risk Agents" value={highRiskCount} icon={AlertTriangle} trend={highRiskCount > 0 ? "down" : "neutral"} trendValue="Needs attention" />
        <KpiCard title="Approvals Pending" value={initialData.filter(d => d.status === "PENDING").length} icon={UserCheck} trend="neutral" trendValue="In queue" />
        <KpiCard title="Policy Coverage %" value="94%" icon={ShieldCheck} trend="up" trendValue="Target: 100%" />
        <KpiCard title="Agents Governance" value="100%" icon={Users} trend="up" trendValue="All agents" />
        <KpiCard title="Compliance Health" value="A+" icon={Activity} trend="up" trendValue="Stable" />
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
                <div><dt className="text-slate-500 mb-1">Risk Score</dt><dd className="text-slate-900 font-medium flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${selectedDecision.riskLevel === 'CRITICAL' || selectedDecision.riskLevel === 'HIGH' ? 'bg-rose-500' : selectedDecision.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} /> {selectedDecision.riskScore} / 100</dd></div>
                <div><dt className="text-slate-500 mb-1">AI Confidence</dt><dd className="text-slate-900 font-medium">{selectedDecision.confidenceScore}%</dd></div>
              </dl>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Explainability & Reasoning</h3>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm text-slate-700 italic shadow-sm leading-relaxed">
                Based on the context provided to <span className="font-semibold text-slate-900">{selectedDecision.agentName}</span>, the model determined that executing the action &quot;{selectedDecision.action}&quot; yields the highest probability of success. The action was evaluated against active IAM and operational policies, mapping to a {selectedDecision.riskLevel} risk tier.
              </div>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Micro-Audit Trail</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[5px] before:h-full before:w-[2px] before:bg-slate-100 pl-4">
                <div className="relative flex justify-between items-center text-sm">
                   <div className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white" />
                   <span className="text-slate-700 font-medium">Agent Proposed Action</span><span className="text-slate-500 text-xs font-mono">{new Date(selectedDecision.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="relative flex justify-between items-center text-sm">
                   <div className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white" />
                   <span className="text-slate-700 font-medium">Policy Engine Verification</span><span className="text-slate-500 text-xs font-mono">+ 120ms</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
