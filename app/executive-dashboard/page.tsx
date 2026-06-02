import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export default async function OrgChartPage() {
  const workers = await prisma.aIWorker.findMany();


  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Organization Chart</h1>
        <p className="text-slate-500 mt-1">Hierarchical mapping of autonomous agent delegation.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {workers.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No AI hierarchy configured yet.</p>
        ) : (
          <div className="space-y-8">
            {workers.map(worker => (
              <div key={worker.id} className="relative">
                <div className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-sm">
                  {worker.name} <span className="font-normal text-slate-400 ml-2">({worker.environment})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}