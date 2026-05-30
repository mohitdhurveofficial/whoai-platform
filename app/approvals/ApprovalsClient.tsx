

"use client";

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

export default function ApprovalsClient({
  initialApprovals,
}: {
  initialApprovals: ApprovalData[];
}) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Approval Center</h1>

      <div className="overflow-x-auto rounded-lg border">
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
            {initialApprovals.map((approval) => (
              <tr key={String(approval.id)} className="border-t">
                <td className="p-3">{approval.id}</td>
                <td className="p-3">{approval.agent_id}</td>
                <td className="p-3">{approval.action_type}</td>
                <td className="p-3">{approval.status}</td>
                <td className="p-3">{approval.created_at}</td>
                <td className="p-3">{approval.reviewer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}