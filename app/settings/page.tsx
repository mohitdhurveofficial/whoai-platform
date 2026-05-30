import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <AppShell
      title="Platform settings"
      description="Manage governance, audit, and enterprise configuration policies from a single place."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <PageHeader
            title="Governance settings"
            description="Configure authorization, risk thresholds, and organizational approval workflows."
          />
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">Review workflow</p>
              <p className="mt-2">Decisions with high risk or policy exceptions require a secondary approver by default.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">Policy enforcement</p>
              <p className="mt-2">New agent actions are evaluated against your active enterprise policy rules before execution.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">Organization access</p>
              <p className="mt-2">Manage teams, roles, and auditor access across your enterprise workspace.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Ready for deployment</p>
          <h3 className="text-xl font-semibold text-slate-950">Enterprise controls in one place</h3>
          <p className="text-sm leading-6 text-slate-600">
            You can manage integrations, audit retention, and approval defaults without disrupting active enforcement.
          </p>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Retention policy</p>
              <p className="mt-2 text-sm text-slate-600">Audit logs are retained for 90 days automatically, with extended retention available on demand.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Risk thresholds</p>
              <p className="mt-2 text-sm text-slate-600">Adjust risk sensitivity levels and minimize false positives in your approval queue.</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
