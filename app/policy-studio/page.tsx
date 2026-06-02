"use client";

import { useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";

type Policy = {
  id: string;
  name: string;
  category: string;
  status: "ACTIVE" | "DRAFT" | "PAUSED" | "ARCHIVED";
  enforcementMode: "ALERT" | "REQUIRE_APPROVAL" | "BLOCK" | "MONITOR";
  description?: string;
  owner?: string;
  version: number;
  assignedAgentCount: number;
  createdAt: string;
  updatedAt: string;
};

const CATEGORIES = ["Finance", "Compliance", "Security", "Operations", "Customer Service"];
const ENFORCEMENT_MODES: Policy["enforcementMode"][] = ["ALERT", "REQUIRE_APPROVAL", "BLOCK", "MONITOR"];

export default function PolicyStudioPage() {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: "policy-1",
      name: "Enterprise Discount Guardrail",
      category: "Finance",
      status: "ACTIVE",
      enforcementMode: "REQUIRE_APPROVAL",
      description: "Restrict pricing discounts above 25% without approval",
      owner: "Finance Team",
      version: 3,
      assignedAgentCount: 2,
      createdAt: "2026-05-20T10:00:00Z",
      updatedAt: "2026-05-28T14:30:00Z",
    },
    {
      id: "policy-2",
      name: "GDPR Data Deletion Control",
      category: "Compliance",
      status: "ACTIVE",
      enforcementMode: "BLOCK",
      description: "Require audit trail for customer data deletions",
      owner: "Legal Team",
      version: 2,
      assignedAgentCount: 1,
      createdAt: "2026-04-15T09:00:00Z",
      updatedAt: "2026-05-25T11:00:00Z",
    },
    {
      id: "policy-3",
      name: "Production Access Control",
      category: "Security",
      status: "DRAFT",
      enforcementMode: "REQUIRE_APPROVAL",
      description: "Multi-factor approval for production modifications",
      owner: "Security Team",
      version: 1,
      assignedAgentCount: 0,
      createdAt: "2026-05-29T16:00:00Z",
      updatedAt: "2026-05-29T16:00:00Z",
    },
  ]);

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    category: CATEGORIES[0],
    enforcementMode: ENFORCEMENT_MODES[1],
    description: "",
  });

  const activeCount = policies.filter((p) => p.status === "ACTIVE").length;
  const draftCount = policies.filter((p) => p.status === "DRAFT").length;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "approved";
      case "DRAFT":
        return "pending";
      case "PAUSED":
        return "rejected";
      default:
        return "rejected";
    }
  };

  const handleCreatePolicy = () => {
    if (!newPolicy.name.trim()) return;

    const policy: Policy = {
      id: `policy-${Date.now()}`,
      name: newPolicy.name,
      category: newPolicy.category,
      status: "DRAFT",
      enforcementMode: newPolicy.enforcementMode,
      description: newPolicy.description,
      owner: "Current User",
      version: 1,
      assignedAgentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPolicies((current) => [policy, ...current]);
    setNewPolicy({ name: "", category: CATEGORIES[0], enforcementMode: ENFORCEMENT_MODES[1], description: "" });
    setIsCreating(false);
  };

  const handleDeletePolicy = (id: string) => {
    setPolicies((current) => current.filter((p) => p.id !== id));
    setSelectedPolicy(null);
  };

  const handleActivatePolicy = (id: string) => {
    setPolicies((current) =>
      current.map((p) => (p.id === id ? { ...p, status: "ACTIVE" } : p))
    );
  };

  return (
    <AppShell
      title="Policy Studio"
      description="Build, version, and enforce AI governance policies with enterprise-grade controls."
    >
      <PageHeader
        title="Policy Studio"
        description="Create and manage governance policies that define how autonomous AI workers operate."
      />

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Policies</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{activeCount}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Draft Policies</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{draftCount}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Policies</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{policies.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Policy List */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Policies</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Policy Library</h2>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              New policy
            </button>
          </div>

          <div className="space-y-3">
            {policies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => setSelectedPolicy(policy)}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  selectedPolicy?.id === policy.id
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-950">{policy.name}</p>
                    <p className="text-xs text-slate-600">{policy.category}</p>
                  </div>
                  <StatusBadge label={policy.status} variant={getStatusVariant(policy.status)} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">v{policy.version}</span>
                  <span className="text-slate-600">{policy.assignedAgentCount} agents</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Policy Details */}
        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 h-fit space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Details</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">{selectedPolicy?.name ?? "No policy selected"}</h2>
          </div>

          {selectedPolicy ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-600 mb-1">Category</p>
                <p className="text-sm font-medium text-slate-950">{selectedPolicy.category}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-600 mb-1">Enforcement Mode</p>
                <div className="flex items-center gap-2">
                  {selectedPolicy.enforcementMode === "BLOCK" && (
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                  )}
                  <p className="text-sm font-medium text-slate-950">{selectedPolicy.enforcementMode}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-600 mb-1">Status</p>
                <p className="text-sm font-medium text-slate-950">{selectedPolicy.status}</p>
              </div>

              {selectedPolicy.description && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Description</p>
                  <p className="text-sm text-slate-700">{selectedPolicy.description}</p>
                </div>
              )}

              <div className="space-y-2 pt-2">
                {selectedPolicy.status === "DRAFT" && (
                  <button
                    onClick={() => handleActivatePolicy(selectedPolicy.id)}
                    className="w-full rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Activate Policy
                  </button>
                )}
                <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
                  <Edit className="h-4 w-4" /> Edit Policy
                </button>
                <button
                  onClick={() => handleDeletePolicy(selectedPolicy.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Select a policy to view details.</p>
          )}
        </aside>
      </div>

      {/* Create Policy Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
          <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-950 mb-4">Create New Policy</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Policy Name</label>
                <input
                  type="text"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Data Access Control"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select
                  value={newPolicy.category}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, category: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Enforcement Mode</label>
                <select
                  value={newPolicy.enforcementMode}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, enforcementMode: e.target.value as Policy["enforcementMode"] }))}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                >
                  {ENFORCEMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Description (optional)</label>
                <textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the policy intent and constraints..."
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreatePolicy}
                  className="flex-1 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
