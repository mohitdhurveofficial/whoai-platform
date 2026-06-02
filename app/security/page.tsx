import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";

export default function SecurityPage() {
  return (
    <AppShell
      title="Security settings"
      description="Configure authentication, API keys, webhooks, and enterprise security policies."
    >
      <PageHeader
        title="Security"
        description="Manage authentication methods, API access, SSO configuration, and compliance settings."
      />

      <div className="space-y-6">
        {/* Authentication */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">Authentication</h2>
            <p className="text-sm text-slate-600 mt-1">Manage how users access your organization.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-950">Two-factor authentication</p>
                <p className="text-sm text-slate-600 mt-1">Require 2FA for all users</p>
              </div>
              <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-300 cursor-pointer">
                <div className="absolute left-1 h-6 w-6 rounded-full bg-white transition-transform duration-300"></div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-950">Single Sign-On (SSO)</p>
                <p className="text-sm text-slate-600 mt-1">Enable enterprise SSO integration</p>
              </div>
              <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-300 cursor-pointer">
                <div className="absolute left-1 h-6 w-6 rounded-full bg-white transition-transform duration-300"></div>
              </div>
            </div>
          </div>
        </section>

        {/* API & Integration */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">API & Integration</h2>
            <p className="text-sm text-slate-600 mt-1">Manage API keys and webhooks for programmatic access.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-950">API Keys</p>
                <p className="text-sm text-slate-600 mt-1">2 active keys</p>
              </div>
              <button className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition">
                Manage
              </button>
            </div>

            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-950">Webhooks</p>
                <p className="text-sm text-slate-600 mt-1">Send real-time events to external systems</p>
              </div>
              <button className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition">
                Configure
              </button>
            </div>
          </div>
        </section>

        {/* Audit & Compliance */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">Audit & Compliance</h2>
            <p className="text-sm text-slate-600 mt-1">Configure audit logging and compliance requirements.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-950">Audit log retention</p>
                <p className="text-sm text-slate-700 font-medium">365 days</p>
              </div>
              <p className="text-sm text-slate-600">Automatically retain audit logs for compliance</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-950">Data residency</p>
                <p className="text-sm text-slate-600 mt-1">Keep data in your region</p>
              </div>
              <StatusBadge label="US (East)" variant="approved" />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950 mb-3">Compliance certifications</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">SOC 2 Type II</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">HIPAA</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">GDPR</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">ISO 27001</span>
              </div>
            </div>
          </div>
        </section>

        {/* Organization Danger Zone */}
        <section className="rounded-[32px] border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4">Danger zone</h2>
          <p className="text-sm text-red-700 mb-4">These actions cannot be undone.</p>

          <div className="space-y-3">
            <button className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 transition">
              Export organization data
            </button>
            <button className="w-full rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm font-semibold text-red-900 hover:bg-red-200 transition">
              Delete organization
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
