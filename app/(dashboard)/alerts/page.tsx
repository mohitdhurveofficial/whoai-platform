import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";
import { AlertRowActions } from "@/components/alerts/AlertRowActions";

const FILTERS = [
  { key: "active", label: "Active" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const rawStatus = resolvedSearchParams.status;
  const status: FilterKey = FILTERS.some((f) => f.key === rawStatus)
    ? (rawStatus as FilterKey)
    : "active";

  // `resolved` is nullable in the schema, so "active" has to include NULL —
  // filtering on `resolved: false` alone would hide every alert written before
  // the column was populated.
  const resolvedFilter =
    status === "active"
      ? { OR: [{ resolved: false }, { resolved: null }] }
      : status === "resolved"
        ? { resolved: true }
        : {};

  const alerts = await prisma.alert.findMany({
    where: { organizationId: auth.organizationId, ...resolvedFilter },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { agent: true },
  });

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">Cost Alerts</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">
            Monitor budget thresholds, token spikes, and runaway agents.
          </p>
        </div>

        {/* Real filter, driven by the URL so it survives a refresh and can be
            linked to — replaces a button that previously did nothing. */}
        <nav aria-label="Filter alerts by status" className="flex items-center gap-1 rounded-lg border border-[#EEE8E2] bg-white p-1 shadow-sm">
          {FILTERS.map((filter) => {
            const active = status === filter.key;
            return (
              <Link
                key={filter.key}
                href={`/alerts?status=${filter.key}`}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
                  active
                    ? "bg-[#FFF5F0] text-[#111111] shadow-sm"
                    : "text-[#666666] hover:bg-[#FAF7F3] hover:text-[#111111]"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#EEE8E2] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[13px]">
            <thead className="border-b border-[#EEE8E2] bg-[#FAF7F3]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Alert Details</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Agent</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Severity</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Date</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {alerts.map((alert) => (
                <tr key={alert.id} className="transition-colors hover:bg-[#FAF7F3]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-semibold text-[#111111]">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          alert.type === "ANOMALY" || alert.type === "COST_SPIKE"
                            ? "text-[#FF6B00]"
                            : "text-red-600"
                        }`}
                      />
                      {alert.type}
                    </div>
                    <div className="mt-1 max-w-[400px] truncate text-[13px] font-medium text-[#666666]">
                      {alert.message}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[#111111]">{alert.agent?.name || "Unknown Agent"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-1 text-[11px] font-bold ${
                        alert.severity === "CRITICAL"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-[#FF6B00]/20 bg-[#FF6B00]/10 text-[#FF6B00]"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#666666]">
                    {alert.createdAt ? alert.createdAt.toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${alert.resolved ? "bg-emerald-500" : "bg-[#FF6B00]"}`} />
                      <span
                        className={`text-[12px] font-semibold ${
                          alert.resolved ? "text-emerald-600" : "text-[#FF6B00]"
                        }`}
                      >
                        {alert.resolved ? "Resolved" : "Active"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <AlertRowActions
                      alertId={alert.id}
                      resolved={Boolean(alert.resolved)}
                      agentId={alert.agentId}
                    />
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-600/50" />
                    <h3 className="text-[16px] font-bold text-[#111111]">
                      {status === "resolved" ? "No resolved alerts" : "All clear"}
                    </h3>
                    <p className="mx-auto mt-1 max-w-sm text-[13px] text-[#666666]">
                      {status === "resolved"
                        ? "Alerts you resolve will be listed here."
                        : "No cost anomalies or budget threshold violations detected."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
