import { getApprovals } from "@/lib/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default async function ApprovalsPage() {
  const approvals = await getApprovals();

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-slate-50 min-h-screen">
        <Navbar />

        <main className="p-8">
          <h1 className="text-4xl font-bold mb-8">
            Approval Center
          </h1>

          <div className="bg-white rounded-xl shadow p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Agent</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>

              <tbody>
                {approvals.map((approval: any) => (
                  <tr
                    key={approval.id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {approval.id}
                    </td>

                    <td className="p-3">
                      {approval.agent_id}
                    </td>

                    <td className="p-3">
                      {approval.status}
                    </td>

                    <td className="p-3">
                      {approval.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}