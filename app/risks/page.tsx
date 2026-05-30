import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";

const riskEvents = [
  {
    id: "risk-1",
    title: "High-value payment flagged",
    aiWorker: "Payments Agent",
    riskLevel: "HIGH",
    severity: "Critical",
    status: "open",
    timestamp: "5 minutes ago",
  },
  {
    id: "risk-2",
    title: "Unusual data access pattern",
    aiWorker: "Analytics Agent",
    riskLevel: "MEDIUM",
    severity: "Medium",
    status: "open",
    timestamp: "12 minutes ago",
  },
  {
    id: "risk-3",
    title: "Policy exception requested",
    aiWorker: "Automation Agent",
    riskLevel: "HIGH",
    severity: "High",
    status: "investigating",
    timestamp: "28 minutes ago",
  },
];

const criticalEvents = riskEvents.filter((r) => r.riskLevel === "HIGH");
const mediumEvents = riskEvents.filter((r) => r.riskLevel === "MEDIUM");

export default function RiskCenterPage() {
  return (
    <AppShell
      title="Risk intelligence"
      description="Continuous risk monitoring, detection, and investigation for AI workers across your organization."
    >
      <PageHeader
        title="Risk Center"
        description="Executive risk dashboard with real-time threat detection, heatmaps, and incident investigations."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Active threats</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{criticalEvents.length}</p>
          <p className="mt-2 text-sm text-slate-600">Critical risk events requiring immediate action.</p>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Under investigation</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">3</p>
          <p className="mt-2 text-sm text-slate-600">Active investigations in progress.</p>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Compliance risk</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">12.3%</p>
          <p className="mt-2 text-sm text-slate-600">Overall organizational risk exposure.</p>
        </div>
      </div>

      <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Risk events</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Open incidents</h2>
        </div>

        <div className="space-y-3">
          {riskEvents.map((event) => (
            <div key={event.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-950">{event.title}</h3>
                    <StatusBadge
                      label={event.riskLevel}
                      variant={
                        event.riskLevel === "HIGH"
                          ? "high"
                          : event.riskLevel === "MEDIUM"
                            ? "medium"
                            : "low"
                      }
                    />
                  </div>
                  <p className="text-sm text-slate-600">{event.aiWorker}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{event.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <h2 className="text-lg font-semibold text-slate-950 mb-4">Critical threats</h2>
          <div className="space-y-3">
            {criticalEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-red-200 bg-red-50 p-3">
                <p className="font-medium text-red-900">{event.title}</p>
                <p className="text-sm text-red-700">{event.aiWorker}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <h2 className="text-lg font-semibold text-slate-950 mb-4">Risk heatmap</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-sm font-medium text-slate-700">Payments</span>
              <div className="h-2 w-24 rounded-full bg-red-200">
                <div className="h-full w-3/4 rounded-full bg-red-500"></div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-sm font-medium text-slate-700">Data Access</span>
              <div className="h-2 w-24 rounded-full bg-amber-200">
                <div className="h-full w-1/2 rounded-full bg-amber-500"></div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-sm font-medium text-slate-700">Infrastructure</span>
              <div className="h-2 w-24 rounded-full bg-green-200">
                <div className="h-full w-1/3 rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
