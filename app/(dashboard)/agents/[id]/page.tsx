import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Edit2 } from "lucide-react";
import { AgentRequestsChart, AgentSpendChart } from "@/app/components/analytics/AgentCharts";
import { getAgentAnalytics } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#EEE8E2] bg-white p-5 shadow-sm">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-[#666666]">{label}</div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

export default async function AgentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");

  const { id } = await params;
  const analytics = await getAgentAnalytics(auth.organizationId, id);
  if (!analytics) notFound();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 text-[#111111] md:p-10">
      <Link href="/agents" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#666666] hover:text-[#111111]">
        <ArrowLeft className="h-4 w-4" />
        Back to Agents
      </Link>

      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">{analytics.agent.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-[#666666]">
            <span className="rounded-md bg-white px-2 py-1 font-mono shadow-sm">{analytics.agent.id}</span>
            <span>{analytics.agent.status}</span>
            <span>{analytics.agent.model ?? "No model yet"}</span>
            <span>Created {new Date(analytics.agent.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <Link href={`/agents/${analytics.agent.id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#EEE8E2] bg-white px-4 py-2 text-[13px] font-semibold shadow-sm">
          <Edit2 className="h-4 w-4" />
          Edit
        </Link>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Daily Budget" value={money(analytics.agent.dailyBudget)} />
        <Stat label="Monthly Budget" value={money(analytics.agent.monthlyBudget)} />
        <Stat label="Current Spend" value={money(analytics.agent.currentSpend)} />
        <Stat label="Remaining Budget" value={money(analytics.agent.remainingBudget)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[16px] font-bold">Spend by Day</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Last 30 days.</p>
          </div>
          <div className="h-[300px]">
            <AgentSpendChart data={analytics.spendByDay} />
          </div>
        </div>
        <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[16px] font-bold">Requests by Day</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Gateway requests for this agent.</p>
          </div>
          <div className="h-[300px]">
            <AgentRequestsChart data={analytics.requestsByDay} />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Stat label="Blocked Requests" value={analytics.blockedRequests.toLocaleString()} />
        <Stat label="Average Cost per Request" value={money(analytics.averageCostPerRequest)} />
        <Stat label="Average Tokens per Request" value={Math.round(analytics.averageTokensPerRequest).toLocaleString()} />
      </section>

      <section className="rounded-lg border border-[#EEE8E2] bg-white p-6 shadow-sm">
        <h2 className="text-[16px] font-bold">Recent Activity</h2>
        <div className="mt-5 divide-y divide-[#EEE8E2]">
          {analytics.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between gap-4 py-3 text-[13px]">
              <div>
                <div className="font-semibold">{activity.action}</div>
                <div className="mt-1 text-[#666666]">{activity.status ?? "Recorded"}</div>
              </div>
              <div className="text-right text-[#666666]">{new Date(activity.timestamp).toLocaleString()}</div>
            </div>
          ))}
          {!analytics.recentActivity.length && (
            <div className="py-10 text-center text-[13px] text-[#888888]">No activity recorded for this agent yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
