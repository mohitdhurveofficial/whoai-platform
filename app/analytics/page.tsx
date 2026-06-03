import { getExecutiveDashboardMetrics } from "@/lib/actions/analytics";
import { TrendingUp, AlertTriangle, Zap, DollarSign, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { toggleAgentKillSwitch } from "@/lib/actions/budget";
import AnalyticsChart from "./AnalyticsChart";

export default async function FinOpsDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Real-world fallback for organization ID depending on your auth strategy
  const orgId = user?.user_metadata?.organizationId || "demo-workspace"; 
  
  const metrics = await getExecutiveDashboardMetrics(orgId);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI FinOps & Health</h1>
          <p className="mt-2 text-slate-600 font-medium">Enterprise command center for API spend, agent operations, and active anomalies.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50">Export CSV</button>
          <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800">Configure Alerts</button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2"><DollarSign size={14}/> Total Spend (MTD)</p>
              <p className="mt-3 text-4xl font-extrabold text-slate-900">${metrics.totalSpendUsd.toFixed(2)}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <TrendingUp className="h-3 w-3" /> Run rate looking healthy
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2"><Activity size={14}/> Token Volume</p>
              <p className="mt-3 text-4xl font-extrabold text-slate-900">{(metrics.totalTokens / 1000).toFixed(1)}k</p>
              <p className="mt-2 text-xs text-slate-500 font-medium">Processed safely via Gateway</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2"><AlertTriangle size={14}/> Active Anomalies</p>
              <p className="mt-3 text-4xl font-extrabold text-rose-600">{metrics.activeAlerts.length}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-rose-600 font-medium">
                Spikes or risk violations detected
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2"><Zap size={14}/> Operational Agents</p>
              <p className="mt-3 text-4xl font-extrabold text-slate-900">{metrics.activeWorkersCount}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 font-medium">
                Currently connected to Gateway
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <AnalyticsChart 
          spendByDay={metrics.spendByDay} 
          spendByDepartment={metrics.spendByDepartment} 
        />
      </div>

      {/* Top Offenders Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Top 10 Expensive Agents</h2>
            <p className="text-sm text-slate-500 font-medium">Review and suspend runaway workflows.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-slate-200 text-xs font-bold text-slate-500 bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4">Agent Name</th>
                <th scope="col" className="px-6 py-4">Environment</th>
                <th scope="col" className="px-6 py-4">Model Used</th>
                <th scope="col" className="px-6 py-4">Tokens Burned</th>
                <th scope="col" className="px-6 py-4">Cost (USD)</th>
                <th scope="col" className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.topSpenders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No agent spend recorded yet.</td></tr>
              ) : (
                metrics.topSpenders.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${agent.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {agent.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{agent.environment}</td>
                    <td className="px-6 py-4 text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-700">{agent.model}</span></td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{agent.tokens.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-900 font-extrabold">${agent.costUsd.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <form action={toggleAgentKillSwitch}>
                        <input type="hidden" name="agentId" value={agent.id} />
                        <input type="hidden" name="currentStatus" value={agent.status} />
                        <button type="submit" className={`font-bold text-xs uppercase tracking-wide px-3 py-1.5 rounded transition-colors ${agent.status === 'ACTIVE' ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
                          {agent.status === 'ACTIVE' ? 'Kill Switch' : 'Enable'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
