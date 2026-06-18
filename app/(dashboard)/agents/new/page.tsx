"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";

export default function CreateAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ text: string; code?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
    dailyBudget: "",
    monthlyBudget: "",
  });
  
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; apiKey: string | null }>({ isOpen: false, apiKey: null });
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
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
        setSuccessModal({ isOpen: true, apiKey: data.generatedApiKey });
      } else {
        setError({ text: data.error, code: data.code });
      }
    } catch (err) {
      setError({ text: err instanceof Error ? err.message : "Failed to create agent" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (successModal.apiKey) {
      navigator.clipboard.writeText(successModal.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setSuccessModal({ isOpen: false, apiKey: null });
    router.push("/agents");
  };

  return (
    <div className="p-10 max-w-[800px] mx-auto space-y-8 bg-[#FAF7F3] min-h-screen text-[#111111] font-sans">
      <Link href="/agents" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#888888] hover:text-[#111111] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Agents
      </Link>
      
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">Create New Agent</h1>
        <p className="mt-1.5 text-[15px] text-[#666666]">Set up a new AI agent and configure its budget limits.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-4 bg-[#FFF0F0] border border-[#FEE2E2] rounded-lg flex items-start gap-3 text-[#DC2626]">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="space-y-2.5">
              <div className="text-[14px] font-medium">{error.text}</div>
              {error.code === "PLAN_LIMIT_REACHED" && (
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#FF6B00] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#E85F00]"
                >
                  Upgrade plan <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
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
            placeholder="e.g. Support Bot, Data Analyst"
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
              placeholder="10.00"
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
              placeholder="100.00"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#111111] text-white px-6 py-2.5 rounded-md text-[14px] font-medium hover:bg-[#222222] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Agent"}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 text-center border-b border-[#EEE8E2]">
              <div className="w-12 h-12 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#16A34A]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111111]">Agent Created Successfully</h3>
              <p className="text-[14px] text-[#666666] mt-2">Your new AI agent is ready to go.</p>
            </div>
            
            <div className="p-6 bg-[#FAFAFA] space-y-4">
              <div className="flex items-start gap-3 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-[#D97706]">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-[13px] font-medium leading-relaxed">
                  <strong>Important:</strong> Copy this API key now. It cannot be viewed again after you close this window.
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-[#111111]">API Key</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-[#DCD5CD] rounded-md px-3 py-2 font-mono text-[13px] text-[#111111] overflow-x-auto break-all">
                    {successModal.apiKey}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="shrink-0 flex items-center justify-center bg-[#111111] text-white w-10 h-[38px] rounded-md hover:bg-[#222222] transition-colors"
                    title="Copy API Key"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#EEE8E2] flex justify-end">
              <button 
                onClick={handleCloseModal}
                className="bg-[#111111] text-white px-6 py-2.5 rounded-md text-[14px] font-medium hover:bg-[#222222] transition-colors w-full"
              >
                I have copied the key, close this window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
