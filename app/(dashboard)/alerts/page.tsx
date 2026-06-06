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
    <div className="p-10 max-w-[1600px] mx-auto space-y-8 bg-[#FAF7F3] min-h-screen text-[#111111] font-sans">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">Cost Alerts</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">Monitor budget thresholds, token spikes, and runaway agents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FFFFFF] border border-[#EEE8E2] px-3 py-2.5 rounded-md shadow-sm text-[13px] font-medium hover:border-[#DCD5CD] transition-colors">
            <Filter className="h-4 w-4 text-[#888888]" />
            Filters
          </button>
        </div>
      </header>

      {/* TABLE */}
      <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#FAFAFA] border-b border-[#EEE8E2]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#888888]">Alert Details</th>
                <th className="px-6 py-4 font-semibold text-[#888888]">Agent</th>
                <th className="px-6 py-4 font-semibold text-[#888888]">Severity</th>
                <th className="px-6 py-4 font-semibold text-[#888888]">Date</th>
                <th className="px-6 py-4 font-semibold text-[#888888]">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-[#888888]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#111111] flex items-center gap-2">
                      {alert.type === 'ANOMALY' || alert.type === 'COST_SPIKE' ? <AlertTriangle className="h-4 w-4 text-[#FF6B00]" /> : <AlertTriangle className="h-4 w-4 text-[#DC2626]" />}
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
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-bold ${alert.severity === 'CRITICAL' ? 'bg-[#FFF0F0] text-[#DC2626]' : 'bg-[#FFF5F0] text-[#FF6B00]'}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#888888] font-medium">
                    {alert.createdAt
  ? alert.createdAt.toLocaleDateString()
  : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${alert.resolved ? 'bg-[#047857]' : 'bg-[#FF6B00]'}`}></div>
                      <span className={`text-[12px] font-semibold ${alert.resolved ? 'text-[#047857]' : 'text-[#FF6B00]'}`}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!(alert.resolved) && (
                        <button title="Resolve" className="p-1.5 text-[#888888] hover:bg-[#F0FDF4] hover:text-[#047857] rounded transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                      )}
                      <button title="Ignore" className="p-1.5 text-[#888888] hover:bg-[#F5F5F5] hover:text-[#111111] rounded transition-colors"><BellOff className="h-4 w-4" /></button>
                      <button title="View Agent" className="p-1.5 text-[#888888] hover:bg-[#F5F5F5] hover:text-[#FF6B00] rounded transition-colors"><Eye className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-[#047857]/50 mx-auto mb-4" />
                    <h3 className="text-[16px] font-bold text-[#111111]">All clear</h3>
                    <p className="text-[13px] text-[#888888] mt-1 max-w-sm mx-auto">No cost anomalies or budget threshold violations detected.</p>
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
