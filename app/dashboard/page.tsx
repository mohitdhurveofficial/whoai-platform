import AppShell from "@/app/components/AppShell";
import { ChartCard } from "@/app/components/ui/ChartCard";
import { MetricCard } from "@/app/components/ui/MetricCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { ActivityFeed } from "@/app/components/ui/ActivityFeed";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { getDashboardMetrics } from "@/lib/api";

export default async function DashboardPage() {
  const {
    overview,
    trend,
    riskDistribution,
    approvalQueue,
    recentDecisions,
    activityFeed,
  } = await getDashboardMetrics();

  const maxTrend = Math.max(...trend.map((point) => point.value), 1);
  const totalRisk = riskDistribution.reduce((sum, bucket) => sum + bucket.value, 0);

  return (
    <AppShell
      title="Command center"
      description="Monitor AI agent governance, approval flows, risk exposure, and policy health from one enterprise console."
    >
      <PageHeader
        title="Governance performance"
        description="Track the metrics that matter: decision velocity, risk trends, approval backlog, and policy enforcement."
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {overview.map((item) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            detail={item.detail}
            trend={item.label === "Policy Violations" ? "negative" : "positive"}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <ChartCard
          title="Decision trend"
          description="Weekly decision volume across enterprise guardrails."
        >
          <div className="mt-6 flex h-[260px] items-end gap-4">
            {trend.map((point) => (
              <div key={point.label} className="flex-1">
                <div className="mx-auto flex h-full items-end justify-center">
                  <div
                    className="w-full rounded-full bg-sky-500"
                    style={{ height: `${(point.value / maxTrend) * 100}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-xs uppercase tracking-[0.24em] text-slate-400">
                  {point.label}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Risk distribution"
          description="Risk exposure by decision severity."
        >
          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-6 overflow-hidden rounded-full bg-slate-200">
                {riskDistribution.map((bucket) => (
                  <div
                    key={bucket.name}
                    className="h-full"
                    style={{ width: `${(bucket.value / totalRisk) * 100}%`, backgroundColor: bucket.color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {riskDistribution.map((bucket) => (
                <div key={bucket.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: bucket.color }} />
                    <p className="text-sm text-slate-700">{bucket.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">{bucket.value} cases</p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Pending queue</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Approval queue</h2>
            </div>
            <p className="text-sm text-slate-500">Sorted by risk and waiting time</p>
          </div>

          <div className="space-y-4">
            {approvalQueue.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.request}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.agent} · {item.owner}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge
                      label={item.risk}
                      variant={item.risk === "High Risk" ? "high" : item.risk === "Medium Risk" ? "medium" : "low"}
                    />
                    <span className="text-sm text-slate-500">{item.requestedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Recent decisions</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Latest approvals and rejections</h2>
            </div>
            <p className="text-sm text-slate-500">Last 24 hours</p>
          </div>

          <div className="space-y-4">
            {recentDecisions.map((decision) => (
              <div key={decision.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{decision.id}</p>
                    <p className="mt-1 text-sm text-slate-600">{decision.agent} · {decision.policy}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      label={decision.risk}
                      variant={decision.risk === "High Risk" ? "high" : decision.risk === "Medium Risk" ? "medium" : "low"}
                    />
                    <StatusBadge
                      label={decision.status}
                      variant={decision.status === "Approved" ? "approved" : decision.status === "Pending" ? "pending" : "rejected"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <ActivityFeed items={activityFeed} />
      </section>
    </AppShell>
  );
}
