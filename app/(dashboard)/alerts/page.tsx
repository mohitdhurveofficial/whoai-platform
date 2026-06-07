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
          <h1 className="text-[28px] font-bold tracking-tight text-white">Cost Alerts</h1>
          <p className="mt-1.5 text-[15px] text-[#A3A3A3]">Monitor budget thresholds, token spikes, and runaway agents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333] px-3 py-2.5 rounded-md shadow-sm text-[13px] font-medium text-white hover:bg-[#222] transition-colors">
            <Filter className="h-4 w-4 text-[#888]" />
            Filters
          </button>
        </div>
      </header>

      {/* TABLE */}
      <div className="bg-[#111] border border-[#222] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#0A0A0A] border-b border-[#222]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#888] uppercase tracking-wider text-[11px]">Alert Details</th>
                <th className="px-6 py-4 font-semibold text-[#888] uppercase tracking-wider text-[11px]">Agent</th>
                <th className="px-6 py-4 font-semibold text-[#888] uppercase tracking-wider text-[11px]">Severity</th>
                <th className="px-6 py-4 font-semibold text-[#888] uppercase tracking-wider text-[11px]">Date</th>
                <th className="px-6 py-4 font-semibold text-[#888] uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-[#888] uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#1A1A1A] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {alert.type === 'ANOMALY' || alert.type === 'COST_SPIKE' ? <AlertTriangle className="h-4 w-4 text-[#FF6B00]" /> : <AlertTriangle className="h-4 w-4 text-[#FF0000]" />}
                      {alert.type}
                    </div>
                    <div className="text-[13px] font-medium text-[#A3A3A3] mt-1 max-w-[400px] truncate">{alert.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-white">
                      {alert.agent?.name || "Unknown Agent"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded border text-[11px] font-bold ${alert.severity === 'CRITICAL' ? 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20' : 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20'}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#A3A3A3] font-medium">
                    {alert.createdAt
  ? alert.createdAt.toLocaleDateString()
  : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${alert.resolved ? 'bg-[#047857]' : 'bg-[#FF6B00]'}`}></div>
                      <span className={`text-[12px] font-semibold ${alert.resolved ? 'text-[#047857]' : 'text-[#FF6B00]'}`}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!(alert.resolved) && (
                        <button title="Resolve" className="p-1.5 text-[#888] hover:bg-[#047857]/10 hover:text-[#047857] rounded transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                      )}
                      <button title="Ignore" className="p-1.5 text-[#888] hover:bg-[#222] hover:text-white rounded transition-colors"><BellOff className="h-4 w-4" /></button>
                      <button title="View Agent" className="p-1.5 text-[#888] hover:bg-[#222] hover:text-[#FF6B00] rounded transition-colors"><Eye className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-[#047857]/50 mx-auto mb-4" />
                    <h3 className="text-[16px] font-bold text-white">All clear</h3>
                    <p className="text-[13px] text-[#A3A3A3] mt-1 max-w-sm mx-auto">No cost anomalies or budget threshold violations detected.</p>
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
