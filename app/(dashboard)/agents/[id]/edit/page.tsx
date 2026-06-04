"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useAgent } from "@/lib/hooks/useAgents";

export default function EditAgentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { agent, loading: fetchLoading, error: fetchError } = useAgent(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
    dailyBudget: "",
    monthlyBudget: "",
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        status: agent.status,
        dailyBudget: agent.dailyBudget.toString(),
        monthlyBudget: agent.monthlyBudget.toString(),
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          status: formData.status,
          dailyBudget: parseFloat(formData.dailyBudget),
          monthlyBudget: parseFloat(formData.monthlyBudget),
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/agents/${id}`);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="p-10 flex justify-center text-[#888888]">Loading agent data...</div>;
  }

  if (fetchError || !agent) {
    return <div className="p-10 text-center text-red-500">Error: {fetchError || "Agent not found"}</div>;
  }

  return (
    <div className="p-10 max-w-[800px] mx-auto space-y-8 bg-[#FAF7F3] min-h-screen text-[#111111] font-sans">
      <Link href={`/agents/${id}`} className="inline-flex items-center gap-2 text-[13px] font-medium text-[#888888] hover:text-[#111111] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Agent Details
      </Link>
      
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">Edit Agent</h1>
        <p className="mt-1.5 text-[15px] text-[#666666]">Update agent configuration and budget limits.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-4 bg-[#FFF0F0] border border-[#FEE2E2] rounded-lg flex items-start gap-3 text-[#DC2626]">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="text-[14px] font-medium">{error}</div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-[13px] font-semibold text-[#111111]">Agent Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-[#DCD5CD] rounded-md text-[14px] outline-none focus:border-[#111111] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[13px] font-semibold text-[#111111]">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-[#DCD5CD] rounded-md text-[14px] outline-none focus:border-[#111111] transition-colors"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="QUARANTINED">QUARANTINED</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-[#111111]">Daily Budget ($)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={formData.dailyBudget}
              onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#DCD5CD] rounded-md text-[14px] outline-none focus:border-[#111111] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-[#111111]">Monthly Budget ($)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={formData.monthlyBudget}
              onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#DCD5CD] rounded-md text-[14px] outline-none focus:border-[#111111] transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link href={`/agents/${id}`} className="px-6 py-2.5 rounded-md text-[14px] font-medium border border-[#DCD5CD] hover:bg-[#FAFAFA] transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#111111] text-white px-6 py-2.5 rounded-md text-[14px] font-medium hover:bg-[#222222] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
