"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAgents } from "@/lib/hooks/useAgents";
import { Search, Filter, MoreVertical, Plus, Bot, Eye, Edit2, Trash2 } from "lucide-react";

export default function AgentsPage() {
  const { agents, loading, deleteAgent } = useAgents();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteModal.id) {
      await deleteAgent(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
      setDropdownOpen(null);
    }
  };

  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-8 bg-[#FAF7F3] min-h-screen text-[#111111] font-sans">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">AI Agents</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">Manage registered agents, monitor status, and review budgets.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/agents/new" className="flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2.5 rounded-md shadow-sm text-[13px] font-medium hover:bg-[#E65A00] transition-colors">
            <Plus className="h-4 w-4" />
            Create Agent
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-2 shadow-sm">
        <div className="flex items-center gap-2 flex-1 pl-2">
          <Search className="h-4 w-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search agents by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-[13px] font-medium outline-none placeholder:text-[#A3A3A3] text-[#111111]"
          />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[#888888]">Loading agents...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#FAFAFA] border-b border-[#EEE8E2]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#888888]">Name</th>
                  <th className="px-6 py-4 font-semibold text-[#888888]">Status</th>
                  <th className="px-6 py-4 font-semibold text-[#888888] text-right">Daily Budget</th>
                  <th className="px-6 py-4 font-semibold text-[#888888] text-right">Monthly Budget</th>
                  <th className="px-6 py-4 font-semibold text-[#888888] text-right">Created Date</th>
                  <th className="px-6 py-4 text-right font-semibold text-[#888888]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8E2]">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-6 py-4 font-semibold text-[#111111]">{agent.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${agent.status === 'ACTIVE' ? 'bg-[#047857]' : agent.status === 'PAUSED' ? 'bg-[#FFB020]' : 'bg-[#DC2626]'}`}></div>
                        <span className={`text-[12px] font-semibold ${agent.status === 'ACTIVE' ? 'text-[#047857]' : agent.status === 'PAUSED' ? 'text-[#FFB020]' : 'text-[#DC2626]'}`}>
                          {agent.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#111111] text-right">${Number(agent.dailyBudget).toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-[#111111] text-right">${Number(agent.monthlyBudget).toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold text-[#111111] text-right">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button onClick={() => setDropdownOpen(dropdownOpen === agent.id ? null : agent.id)} className="p-1.5 text-[#888888] hover:bg-[#F5F5F5] hover:text-[#111111] rounded transition-colors inline-block">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {dropdownOpen === agent.id && (
                        <div className="absolute right-8 top-10 w-32 bg-white border border-[#EEE8E2] rounded-md shadow-lg z-10 py-1 text-left">
                          <Link href={`/agents/${agent.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-[#F5F5F5] text-[13px] text-[#111111]">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                          <Link href={`/agents/${agent.id}/edit`} className="flex items-center gap-2 px-3 py-2 hover:bg-[#F5F5F5] text-[13px] text-[#111111]">
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </Link>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: agent.id })} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#FFF0F0] text-[13px] text-[#DC2626]">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAgents.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Bot className="h-10 w-10 text-[#DCD5CD] mx-auto mb-4" />
                      <h3 className="text-[16px] font-bold text-[#111111]">No agents found</h3>
                      <p className="text-[13px] text-[#888888] mt-1 max-w-sm mx-auto">Create your first agent to start managing limits.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Agent?</h3>
            <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
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
