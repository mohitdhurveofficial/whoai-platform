import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { getDashboardMetrics } from "@/lib/api";

export default async function MetricsPage() {
  const metrics = await getDashboardMetrics();

  return (
    <AppShell
      title="Platform metrics"
      description="Live platform telemetry, risk distribution, and operational performance for your AI governance stack."
    >
      <PageHeader
        title="Metrics"
        description="A unified view of system health, decision outcomes, and overall governance efficacy."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <h2 className="text-lg font-semibold text-slate-950">Platform snapshot</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {metrics.overview.slice(0, 4).map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <h2 className="text-lg font-semibold text-slate-950">Risk distribution</h2>
          <div className="mt-6 space-y-3">
            {metrics.riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">{item.name}</p>
                <p className="text-sm font-semibold text-slate-950">{Math.round((item.value / metrics.riskDistribution.reduce((sum, bucket) => sum + bucket.value, 0)) * 100)}%</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
