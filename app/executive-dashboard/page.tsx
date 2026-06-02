import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const revalidate = 0;

export default async function OrgChartPage() {
  const workers = await prisma.aIWorker.findMany({
    include: { subordinates: true }
  });

  // Top level AI Managers
  const topLevel = workers.filter(w => !w.managerId);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Organization Chart</h1>
        <p className="text-slate-500 mt-1">Hierarchical mapping of autonomous agent delegation.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {topLevel.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No AI hierarchy configured yet.</p>
        ) : (
          <div className="space-y-8">
            {topLevel.map(manager => (
              <div key={manager.id} className="relative">
                <div className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-sm">
                  {manager.name} <span className="font-normal text-slate-400 ml-2">({manager.role})</span>
                </div>
                <div className="mt-4 ml-8 border-l-2 border-slate-200 pl-8 space-y-4">
                  {manager.subordinates.map(sub => (
                    <div key={sub.id} className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl font-medium text-slate-800 shadow-sm w-max">
                      {sub.name} <span className="font-normal text-slate-500 ml-2">({sub.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}