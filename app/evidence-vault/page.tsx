import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export default async function EvidenceVaultPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Evidence Vault</h1>
        <p className="text-slate-500 mt-1">Secure storage for compliance documentation and audit logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auditLogs.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white border rounded-xl shadow-sm text-slate-500">
            No evidence records found in the vault.
          </div>
        ) : (
          auditLogs.map(log => (
            <div key={log.id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs uppercase tracking-wide">
                  AUDIT
                </div>
                <h3 className="font-semibold text-slate-900 truncate" title={log.action}>{log.action}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Logged on {new Date(log.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-slate-700 font-medium">Resource: {log.resource}</p>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}