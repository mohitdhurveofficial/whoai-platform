"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { MOCK_AGENTS } from "@/lib/mock/agents";
import { MOCK_RISKS } from "@/lib/mock/risks";
import { MOCK_APPROVALS } from "@/lib/mock/approvals";
import { Bot, CheckSquare, AlertTriangle, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
	const pendingApprovals = MOCK_APPROVALS.filter(a => a.status === "Pending").length;
	const criticalRisks = MOCK_RISKS.filter(r => r.severity === "Critical" && !r.resolved).length;

	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => setIsMounted(true), []);

	return (
		<div className="space-y-6 pb-12">
			<PageHeader title="Executive Overview" description="AI Governance & Compliance Posture" />

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<KpiCard title="Active AI Agents" value={MOCK_AGENTS.filter(a => a.status === "Active").length} icon={Bot} />
				<KpiCard title="Pending Approvals" value={pendingApprovals} icon={CheckSquare} />
				<KpiCard title="Critical Risks" value={criticalRisks} icon={AlertTriangle} />
				<KpiCard title="Compliance Score" value="94%" icon={ShieldCheck} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<SectionCard title="Decision Volume & Risk Trend" description="Total AI decisions mapped against flagged risk events.">
						<div className="mt-4 p-6">Chart placeholder</div>
					</SectionCard>
				</div>

				<div className="lg:col-span-1 space-y-6">
					<SectionCard title="Recent Risk Events">
						<div className="space-y-4 mt-2">
							{MOCK_RISKS.map(risk => (
								<div key={risk.id} className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
									<div className="flex items-center justify-between">
										<span className="text-xs font-semibold text-slate-500">{risk.type}</span>
										<RiskBadge level={risk.severity} />
									</div>
									<p className="text-sm text-slate-700">{risk.description}</p>
								</div>
							))}
						</div>
					</SectionCard>
				</div>
			</div>
		</div>
	);
}
