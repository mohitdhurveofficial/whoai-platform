import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";

export default function DoctorPage() {
  return (
    <AppShell
      title="AI doctor"
      description="Explore risk diagnostics, suggested policy adjustments, and operational insights for your autonomous agents."
    >
      <PageHeader
        title="Risk diagnostics"
        description="A concise view of agent health, alert triggers, and recommended governance actions."
      />

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-950">Top risk area</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Data retention</p>
            <p className="mt-2 text-sm text-slate-600">Your privacy agent has flagged multiple deletion requests that require review.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-950">Recommended action</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Refine GDPR guardrails</p>
            <p className="mt-2 text-sm text-slate-600">Tighten policy conditions for deletion workflows and approval thresholds.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-950">Status</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Monitoring</p>
            <p className="mt-2 text-sm text-slate-600">All diagnostics are active and ready for the next governance cycle.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
