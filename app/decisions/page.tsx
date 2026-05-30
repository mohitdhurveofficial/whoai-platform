"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { DataTable } from "@/components/ui/DataTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlideOver } from "@/components/ui/SlideOver";
import { MOCK_DECISIONS } from "@/lib/mock/decisions";
import { MOCK_AGENTS } from "@/lib/mock/agents";
import { Decision } from "@/lib/types/governance";
import { Eye, Download } from "lucide-react";

const FILTER_TABS = [
	"All",
	"Low Risk",
	"Medium Risk",
	"High Risk",
	"Critical Risk",
	"Needs Approval",
	"Approved",
	"Rejected",
];

function getRiskLevel(score: number) {
	if (score >= 90) return "Critical";
	if (score >= 70) return "High";
	if (score >= 40) return "Medium";
	return "Low";
}

export default function DecisionsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("All");
	const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

	const filteredData = useMemo(() => {
		const normalizedSearch = searchQuery.toLowerCase();
		return MOCK_DECISIONS.filter((decision) => {
			const agentName = MOCK_AGENTS.find(a => a.id === decision.agentId)?.name || "";
			const matchesSearch =
				decision.id.toLowerCase().includes(normalizedSearch) ||
				decision.action.toLowerCase().includes(normalizedSearch) ||
				agentName.toLowerCase().includes(normalizedSearch);

			const riskLevel = getRiskLevel(decision.riskScore);

			const matchesTab =
				activeTab === "All" ||
				(activeTab === "Low Risk" && riskLevel === "Low") ||
				(activeTab === "Medium Risk" && riskLevel === "Medium") ||
				(activeTab === "High Risk" && riskLevel === "High") ||
				(activeTab === "Critical Risk" && riskLevel === "Critical") ||
				(activeTab === "Needs Approval" && decision.approvalStatus === "Pending") ||
				(activeTab === "Approved" && decision.approvalStatus === "Approved") ||
				(activeTab === "Rejected" && decision.approvalStatus === "Rejected");

			return matchesSearch && matchesTab;
		});
	}, [searchQuery, activeTab]);

	const columns = [
		{ header: "Decision ID", accessorKey: "id" },
		{ header: "Timestamp", accessorKey: "timestamp" },
		{ header: "Agent", accessorKey: "agentId", cell: (item: any) => (MOCK_AGENTS.find(a => a.id === item.agentId)?.name || item.agentId) },
		{ header: "Action", accessorKey: "action" },
		{ header: "Risk Score", accessorKey: "riskScore", cell: (item: any) => <RiskBadge level={getRiskLevel(item.riskScore)} /> },
		{ header: "Status", accessorKey: "approvalStatus", cell: (item: any) => <StatusBadge status={item.approvalStatus} /> },
		{ header: "", cell: (item: any) => <button onClick={() => setSelectedDecision(item)} className="text-indigo-600">Review</button> },
	];

	return (
		<div className="space-y-6 pb-12">
			<PageHeader 
				title="Decision Registry" 
				description="Immutable ledger of all AI agent decisions and actions."
				action={
					<button className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-all">
						<Download className="h-4 w-4" />
						Export Registry
					</button>
				}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<KpiCard title="Decisions Today" value={MOCK_DECISIONS.length} />
				<KpiCard title="High Risk Decisions" value={MOCK_DECISIONS.filter(d => d.riskScore >= 70).length} />
				<KpiCard title="Human Reviewed %" value={`${Math.round((MOCK_DECISIONS.filter(d => d.approvalStatus !== 'Pending').length / MOCK_DECISIONS.length) * 100)}%`} />
				<KpiCard title="Avg Confidence Score" value={`${Math.round(MOCK_DECISIONS.reduce((acc, d) => acc + d.confidenceScore, 0) / MOCK_DECISIONS.length)}%`} />
			</div>

			<SectionCard title="Registry Log">
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<SearchBar placeholder="Search decisions by ID, agent, or action..." onChange={setSearchQuery} />
						<div className="overflow-x-auto pb-2 sm:pb-0">
							<FilterTabs tabs={FILTER_TABS} activeTab={activeTab} onChange={setActiveTab} />
						</div>
					</div>

					<DataTable columns={columns} data={filteredData} keyExtractor={(item) => item.id} />
				</div>
			</SectionCard>

			<SlideOver isOpen={!!selectedDecision} onClose={() => setSelectedDecision(null)} title="Decision Review Details">
				{selectedDecision && (
					<div className="p-4">
						<h3 className="font-semibold">{selectedDecision.id}</h3>
						<p className="text-sm mt-2">{selectedDecision.description}</p>
					</div>
				)}
			</SlideOver>
		</div>
	);
}

