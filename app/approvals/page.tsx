import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 0;

export default async function ApprovalQueuePage() {
  const requests = await prisma.approval.findMany({
    where: { status: 'PENDING' },
    include: { decision: { include: { agent: true, policy: true } } },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Approval Queue</h1>
          <p className="text-slate-500 mt-1">Manage pending enterprise governance decisions.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 text-center bg-white border rounded-xl shadow-sm text-slate-500">
          No pending approvals in the queue.
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req.id} className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-slate-900">{req.decision.actionType}</h3>
                  <span className={`px-2 py-1 text-xs font-bold text-white rounded ${req.decision.policy?.riskLevel === 'CRITICAL' ? 'bg-red-700' : req.decision.policy?.riskLevel === 'HIGH' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                    {req.decision.policy?.riskLevel || 'UNKNOWN'}
                  </span>
                </div>
                <p className="text-sm text-slate-500">AI Worker: <span className="font-medium">{req.decision.agent.name}</span> | Status: {req.status}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800">Review</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}