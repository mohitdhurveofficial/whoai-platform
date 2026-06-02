import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const revalidate = 0;

export default async function EvidenceVaultPage() {
  const evidenceFiles = await prisma.evidence.findMany({
    orderBy: { createdAt: 'desc' },
    include: { decision: true, policy: true }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Evidence Vault</h1>
        <p className="text-slate-500 mt-1">Secure storage for compliance documentation and audit logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evidenceFiles.map(file => (
          <div key={file.id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs uppercase tracking-wide">
                  {file.fileType}
                </div>
                <h3 className="font-semibold text-slate-900 truncate" title={file.fileName}>{file.fileName}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Uploaded on {new Date(file.createdAt).toLocaleDateString()}</p>
            </div>
            
            <a href={file.url} target="_blank" rel="noreferrer" className="w-full text-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition">
              View Evidence
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}