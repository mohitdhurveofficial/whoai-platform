import React from "react";
import { createClient } from "@/utils/supabase/server";
import { AlertTriangle, CheckCircle2, Eye, Filter, BellOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/server/auth";

export default async function AlertsPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const auth = await getServerAuthContext();
  const organizationId = auth?.organizationId;

  const alerts = organizationId ? await prisma.alert.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: { agent: true }
  }) : [];


  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">Cost Alerts</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">Monitor budget thresholds, token spikes, and runaway agents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FAF7F3] border border-[#EEE8E2] px-3 py-2.5 rounded-md shadow-sm text-[13px] font-medium text-[#111111] hover:bg-[#F0EBE5] hover:border-[#DCD5CD] transition-colors">
            <Filter className="h-4 w-4 text-[#888888]" />
            Filters
          </button>
        </div>
      </header>

      {/* TABLE */}
      <div className="bg-white border border-[#EEE8E2] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.05)] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#FAF7F3] border-b border-[#EEE8E2]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Alert Details</th>
                <th className="px-6 py-4 font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Agent</th>
                <th className="px-6 py-4 font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Severity</th>
                <th className="px-6 py-4 font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Date</th>
                <th className="px-6 py-4 font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#FAF7F3] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#111111] flex items-center gap-2">
                      {alert.type === 'ANOMALY' || alert.type === 'COST_SPIKE' ? <AlertTriangle className="h-4 w-4 text-[#FF6B00]" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                      {alert.type}
                    </div>
                    <div className="text-[13px] font-medium text-[#666666] mt-1 max-w-[400px] truncate">{alert.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[#111111]">
                      {alert.agent?.name || "Unknown Agent"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded border text-[11px] font-bold ${alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20'}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#666666] font-medium">
                    {alert.createdAt
  ? alert.createdAt.toLocaleDateString()
  : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${alert.resolved ? 'bg-emerald-500' : 'bg-[#FF6B00]'}`}></div>
                      <span className={`text-[12px] font-semibold ${alert.resolved ? 'text-emerald-600' : 'text-[#FF6B00]'}`}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!(alert.resolved) && (
                        <button title="Resolve" className="p-1.5 text-[#888888] hover:bg-emerald-50 hover:text-emerald-600 rounded transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                      )}
                      <button title="Ignore" className="p-1.5 text-[#888888] hover:bg-[#FAF7F3] hover:text-[#111111] rounded transition-colors"><BellOff className="h-4 w-4" /></button>
                      <button title="View Agent" className="p-1.5 text-[#888888] hover:bg-[#FAF7F3] hover:text-[#FF6B00] rounded transition-colors"><Eye className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600/50 mx-auto mb-4" />
                    <h3 className="text-[16px] font-bold text-[#111111]">All clear</h3>
                    <p className="text-[13px] text-[#666666] mt-1 max-w-sm mx-auto">No cost anomalies or budget threshold violations detected.</p>
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
