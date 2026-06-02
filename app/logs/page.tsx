import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { getAuditLogs } from "@/lib/api";

export default async function LogsPage() {
  const logs = await getAuditLogs();

  return (
    <AppShell
      title="Audit timeline"
      description="Review all governance events, policy decisions, and actor outcomes in a secure audit trail."
    >
      <PageHeader
        title="Audit logs"
        description="A chronological record of AI decisions, approvals, policy flags, and user actions across your organization."
      />

      <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <div className="space-y-6">
          {logs.map((log) => (
            <article key={log.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{log.event}</p>
                  <p className="mt-2 text-sm text-slate-600">{log.detail}</p>
                </div>
                <div className="space-y-1 text-right text-sm text-slate-500">
                  <p>{log.timestamp}</p>
                  <p>{log.actor}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm shadow-slate-200/30">Policy: {log.policy}</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm shadow-slate-200/30">Outcome: {log.outcome}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
