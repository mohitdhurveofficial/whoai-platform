"use client";
import React from "react";

export type ApprovalData = {
	id: string | number;
	agent_id: string | number;
	action_type: string;
	status: string;
	created_at: string;
	risk_level: string;
	policy_impact: string;
	reviewer: string;
};

export default function ApprovalsClient({ initialApprovals }: { initialApprovals: ApprovalData[] }) {
	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">Approval Center</h2>
			<div className="overflow-x-auto bg-white rounded-md shadow-sm">
				<table className="w-full text-left">
					<thead>
						<tr>
							<th className="p-3">ID</th>
							<th className="p-3">Agent</th>
							<th className="p-3">Action</th>
							<th className="p-3">Status</th>
							<th className="p-3">Created</th>
							<th className="p-3">Reviewer</th>
						</tr>
					</thead>
					<tbody>
						{initialApprovals.map((a) => (
							<tr key={String(a.id)} className="border-t">
								<td className="p-3">{String(a.id)}</td>
								<td className="p-3">{a.agent_id}</td>
								<td className="p-3">{a.action_type}</td>
								<td className="p-3">{a.status}</td>
								<td className="p-3">{a.created_at}</td>
								<td className="p-3">{a.reviewer}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
