"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, Activity, DollarSign } from "lucide-react";
import { useAgent, useAgents } from "@/lib/hooks/useAgents";

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { agent, loading, error } = useAgent(id);
  const { deleteAgent } = useAgents();
  
  const [deleteModal, setDeleteModal] = useState(false);

  if (loading) {
    return <div className="p-10 flex justify-center text-[#888888]">Loading agent details...</div>;
  }

  if (error || !agent) {
    return <div className="p-10 text-center text-red-500">Error: {error || "Agent not found"}</div>;
  }

  const handleDelete = async () => {
    await deleteAgent(agent.id);
    router.push("/agents");
  };

  return (
    <div className="p-10 max-w-[1200px] mx-auto space-y-8 bg-[#FAF7F3] min-h-screen text-[#111111] font-sans">
      <Link href="/agents" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#888888] hover:text-[#111111] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Agents
      </Link>
      
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">{agent.name}</h1>
          <div className="mt-2 flex items-center gap-4 text-[13px] text-[#888888]">
            <span className="font-mono bg-[#E5E5E5] px-2 py-1 rounded text-[#111111]">ID: {agent.id}</span>
            <span>Created on {new Date(agent.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/agents/${agent.id}/edit`} className="flex items-center gap-2 bg-white border border-[#EEE8E2] text-[#111111] px-4 py-2 rounded-md shadow-sm text-[13px] font-medium hover:bg-[#F5F5F5] transition-colors">
            <Edit2 className="h-4 w-4" /> Edit
          </Link>
          <button onClick={() => setDeleteModal(true)} className="flex items-center gap-2 bg-[#FFF0F0] text-[#DC2626] border border-[#FEE2E2] px-4 py-2 rounded-md shadow-sm text-[13px] font-medium hover:bg-[#FEE2E2] transition-colors">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm">
          <h3 className="text-[13px] font-semibold text-[#888888] uppercase tracking-wider mb-4">Status & Configuration</h3>
          <div className="space-y-4">
            <div>
              <span className="block text-[12px] text-[#888888] mb-1">Status</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${agent.status === 'ACTIVE' ? 'bg-[#047857]' : agent.status === 'PAUSED' ? 'bg-[#FFB020]' : 'bg-[#DC2626]'}`}></div>
                <span className={`text-[13px] font-semibold ${agent.status === 'ACTIVE' ? 'text-[#047857]' : agent.status === 'PAUSED' ? 'text-[#FFB020]' : 'text-[#DC2626]'}`}>
                  {agent.status}
                </span>
              </div>
            </div>
            <div>
              <span className="block text-[12px] text-[#888888] mb-1">Organization ID</span>
              <span className="text-[13px] font-mono text-[#111111]">{agent.organizationId}</span>
            </div>
            <div>
              <span className="block text-[12px] text-[#888888] mb-1">Client ID</span>
              <span className="text-[13px] font-mono text-[#111111]">{agent.clientId || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm col-span-2">
          <h3 className="text-[13px] font-semibold text-[#888888] uppercase tracking-wider mb-4">Budget & Spend</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#EEE8E2]">
              <div className="flex items-center gap-2 text-[#888888] mb-2 text-[13px]">
                <Activity className="h-4 w-4" /> Daily Budget
              </div>
              <div className="text-2xl font-bold text-[#111111]">${Number(agent.dailyBudget).toFixed(2)}</div>
            </div>
            <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#EEE8E2]">
              <div className="flex items-center gap-2 text-[#888888] mb-2 text-[13px]">
                <Activity className="h-4 w-4" /> Monthly Budget
              </div>
              <div className="text-2xl font-bold text-[#111111]">${Number(agent.monthlyBudget).toFixed(2)}</div>
            </div>
            <div className="p-4 bg-[#FFF5F0] rounded-lg border border-[#FEEBC8]">
              <div className="flex items-center gap-2 text-[#D97706] mb-2 text-[13px] font-medium">
                <DollarSign className="h-4 w-4" /> Current Daily Spend
              </div>
              <div className="text-2xl font-bold text-[#D97706]">${Number(agent.currentDailySpend).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Agent?</h3>
            <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
