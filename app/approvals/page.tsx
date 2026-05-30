"use client";

import ApprovalsClient from "./ApprovalsClient";
import { MOCK_APPROVALS } from "@/lib/mock/approvals";
import { MOCK_DECISIONS } from "@/lib/mock/decisions";
import { MOCK_AGENTS } from "@/lib/mock/agents";

export default function ApprovalsPage() {
	const enrichedApprovals = MOCK_APPROVALS.map((app) => {
		const decision = MOCK_DECISIONS.find((d) => d.id === app.decisionId);
		const agent = MOCK_AGENTS.find((a) => a.name === decision?.agent);

		return {
			id: app.id,
			agent_id: agent?.name || decision?.agent || "Unknown",
			action_type: decision?.action || "Unknown Action",
			status: app.status.toLowerCase() as "pending" | "approved" | "rejected",
			created_at: app.requestedAt,
			risk_level: (decision?.riskScore ? (decision.riskScore >= 70 ? "high" : decision.riskScore >= 40 ? "medium" : "low") : "medium") as "high" | "medium" | "low",
			policy_impact: decision?.policy || "General Policy",
			reviewer: app.reviewedBy || "-",
		};
	});

	return <ApprovalsClient initialApprovals={enrichedApprovals} />;
}
