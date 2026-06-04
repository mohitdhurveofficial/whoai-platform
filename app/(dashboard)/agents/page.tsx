import React from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Search, Filter, MoreVertical, Plus, Play, Pause, Trash2, BarChart2, Bot } from "lucide-react";

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = user?.user_metadata?.organizationId || "demo-workspace";

  const agents = await prisma.agent.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-8 bg-[#FAF7F3] min-h-screen text-[#111111] font-sans">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">AI Agents</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">Manage agent budgets, monitor spend, and enforce usage limits.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2.5 rounded-md shadow-sm text-[13px] font-medium hover:bg-[#E65A00] transition-colors">
            <Plus className="h-4 w-4" />
            New Agent
          </button>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-4 bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-2 shadow-sm">
        <div className="flex items-center gap-2 flex-1 pl-2">
          <Search className="h-4 w-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search agents by name, owner, or environment..." 
            className="w-full text-[13px] font-medium outline-none placeholder:text-[#A3A3A3] text-[#111111]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-[#FAFAFA] border border-[#EEE8E2] px-3 py-1.5 rounded text-[13px] font-medium text-[#666666] hover:bg-[#F5F5F5] transition-colors">
            <Filter className="h-3.5 w-3.5" /> Status
          </button>
          <button className="flex items-center gap-2 bg-[#FAFAFA] border border-[#EEE8E2] px-3 py-1.5 rounded text-[13px] font-medium text-[#666666] hover:bg-[#F5F5F5] transition-colors">
            <Filter className="h-3.5 w-3.5" /> Department
          </button>
          <button className="flex items-center gap-2 bg-[#FAFAFA] border border-[#EEE8E2] px-3 py-1.5 rounded text-[13px] font-medium text-[#666666] hover:bg-[#F5F5F5] transition-colors">
            <Filter className="h-3.5 w-3.5" /> Cost Range
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#FAFAFA] border-b border-[#EEE8E2]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#888888]">Agent Details</th>
                <th className="px-6 py-4 font-semibold text-[#888888]">Model</th>
                <th className="px-6 py-4 font-semibold text-[#888888] text-right">Today&apos;s Spend</th>
                <th className="px-6 py-4 font-semibold text-[#888888] text-right">Monthly Spend</th>
                <th className="px-6 py-4 font-semibold text-[#888888] text-right">Budget Assigned</th>
                <th className="px-6 py-4 font-semibold text-[#888888]">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-[#888888]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#111111]">{agent.name}</div>
                    <div className="text-[12px] font-medium text-[#888888] mt-0.5">{agent.description || "No description"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#F5F5F5] text-[#111111] font-medium text-[12px] border border-[#EEE8E2]">
                      {agent.model}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#111111] text-right">
                    ${((agent.dailyBudget || 0) * 0.1).toFixed(2)} {/* Mock spend calculation */}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#111111] text-right">
                    ${((agent.monthlyBudget || 0) * 0.4).toFixed(2)} {/* Mock spend calculation */}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-[13px] font-medium text-[#111111]">${agent.dailyBudget?.toFixed(2) || '0.00'} / day</div>
                    <div className="text-[11px] font-medium text-[#A3A3A3] mt-0.5">${agent.monthlyBudget?.toFixed(2) || '0.00'} / mo</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${agent.status === 'ACTIVE' ? 'bg-[#047857]' : 'bg-[#A3A3A3]'}`}></div>
                      <span className={`text-[12px] font-semibold ${agent.status === 'ACTIVE' ? 'text-[#047857]' : 'text-[#888888]'}`}>
                        {agent.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {agent.status === 'ACTIVE' ? (
                        <button title="Pause Agent" className="p-1.5 text-[#888888] hover:bg-[#F5F5F5] hover:text-[#111111] rounded transition-colors"><Pause className="h-4 w-4" /></button>
                      ) : (
                        <button title="Resume Agent" className="p-1.5 text-[#888888] hover:bg-[#F5F5F5] hover:text-[#047857] rounded transition-colors"><Play className="h-4 w-4" /></button>
                      )}
                      <button title="View Analytics" className="p-1.5 text-[#888888] hover:bg-[#F5F5F5] hover:text-[#FF6B00] rounded transition-colors"><BarChart2 className="h-4 w-4" /></button>
                      <button title="Delete Agent" className="p-1.5 text-[#888888] hover:bg-[#FFF0F0] hover:text-[#DC2626] rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
                      <button className="p-1.5 text-[#888888] hover:bg-[#F5F5F5] hover:text-[#111111] rounded transition-colors"><MoreVertical className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Bot className="h-10 w-10 text-[#DCD5CD] mx-auto mb-4" />
                    <h3 className="text-[16px] font-bold text-[#111111]">No agents found</h3>
                    <p className="text-[13px] text-[#888888] mt-1 max-w-sm mx-auto">You haven&apos;t registered any AI agents yet. Register your first agent to start tracking spend.</p>
                    <button className="mt-6 bg-[#111111] text-white px-4 py-2 rounded font-medium text-[13px] shadow-sm hover:bg-[#222222] transition-colors">
                      Register Agent
                    </button>
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
