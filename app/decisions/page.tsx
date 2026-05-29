

import { getDecisions } from "@/lib/api";

export default async function DecisionsPage() {
  const decisions = await getDecisions();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Decision Audit Trail</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Agent</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Decision</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Policy</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision: any) => (
              <tr key={decision.id} className="border-t">
                <td className="p-3">{decision.id}</td>
                <td className="p-3">{decision.agent_id}</td>
                <td className="p-3">{decision.action_type}</td>
                <td className="p-3 font-semibold">{decision.decision}</td>
                <td className="p-3">{decision.reason}</td>
                <td className="p-3">{decision.policy_id}</td>
                <td className="p-3">
                  {new Date(decision.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}