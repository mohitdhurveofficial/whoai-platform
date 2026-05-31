"use client";

import { useEffect, useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Plus, Lock, Zap } from "lucide-react";

type AIWorker = {
  id: string;
  name: string;
  role: string;
  department: string;
  owner: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED" | "INACTIVE";
  riskScore: number;
  permissions: number;
  decisionsToday: number;
};

const permissions = [
  { id: "perm-1", name: "Read CRM", resource: "CRM", action: "READ" },
  { id: "perm-2", name: "Send Emails", resource: "EMAIL", action: "WRITE" },
  { id: "perm-3", name: "Access Customer Data", resource: "CUSTOMER_DATA", action: "READ" },
  { id: "perm-4", name: "Execute Payments", resource: "PAYMENTS", action: "EXECUTE" },
  { id: "perm-5", name: "Modify Systems", resource: "PRODUCTION", action: "WRITE" },
  { id: "perm-6", name: "Access Logs", resource: "AUDIT_LOGS", action: "READ" },
];

export default function AIWorkforcePage() {
  const [workers, setWorkers] = useState<AIWorker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    async function loadWorkers() {
      try {
        const response = await fetch("/api/ai-workers");
        if (!response.ok) {
          throw new Error("Unable to load AI workers.");
        }

        const data: AIWorker[] = await response.json();
        setWorkers(data);
        setSelectedWorkerId(data[0]?.id ?? null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkers();
  }, []);

  const selectedWorker = workers.find((worker) => worker.id === selectedWorkerId) ?? workers[0] ?? null;
  const workerPermissions = selectedWorker ? permissions.slice(0, selectedWorker.permissions) : [];

  async function handleDeployWorker() {
    setIsDeploying(true);

    try {
      const response = await fetch("/api/ai-workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Platform Agent ${workers.length + 1}`,
          role: "Orchestration Engine",
          department: "Platform",
          owner: "AI Operations",
          description: "Autonomous worker created for mission control",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to deploy new worker.");
      }

      const createdWorker: AIWorker = await response.json();
      setWorkers((current) => [createdWorker, ...current]);
      setSelectedWorkerId(createdWorker.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <AppShell
      title="AI workforce management"
      description="Manage autonomous AI workers with identity, permissions, monitoring, and governance controls."
    >
      <PageHeader
        title="AI Workforce"
        description="Command center for deploying, monitoring, and controlling your organization's AI workers."
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.85fr]">
        {/* Workers List */}
        <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Workforce</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Active AI workers</h2>
            </div>
            <button
              onClick={handleDeployWorker}
              disabled={isDeploying}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70 transition"
            >
              <Plus className="h-4 w-4" />
              {isDeploying ? "Deploying..." : "Deploy worker"}
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Loading AI workforce...</div>
          ) : workers.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              No AI workers found. Deploy one to begin managing identity and permissions.
            </div>
          ) : (
            <div className="space-y-3">
              {workers.map((worker) => (
                <button
                  key={worker.id}
                  onClick={() => setSelectedWorkerId(worker.id)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    worker.id === selectedWorker?.id
                      ? "border-sky-500 bg-sky-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{worker.name}</p>
                      <p className="text-sm text-slate-600">{worker.role}</p>
                    </div>
                    <StatusBadge
                      label={worker.status}
                      variant={
                        worker.status === "ACTIVE"
                          ? "approved"
                          : worker.status === "PAUSED"
                          ? "pending"
                          : "rejected"
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-2xl bg-slate-100 px-2 py-1">
                      <p className="text-slate-600">Risk: {worker.riskScore}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-2 py-1">
                      <p className="text-slate-600">Perms: {worker.permissions}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-2 py-1">
                      <p className="text-slate-600">Today: {worker.decisionsToday}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Worker Details */}
        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Worker ID</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{selectedWorker ? selectedWorker.name : "No worker selected"}</h2>
          </div>

          {selectedWorker ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Department</p>
                <p className="mt-2 font-semibold text-slate-950">{selectedWorker.department}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Owner</p>
                <p className="mt-2 font-semibold text-slate-950">{selectedWorker.owner}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Score</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${selectedWorker.riskScore}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-slate-950">{selectedWorker.riskScore}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                  <Lock className="h-4 w-4" />
                  Manage identity
                </button>
                <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                  <Zap className="h-4 w-4" />
                  View permissions
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              Select or deploy a worker to inspect its identity and governance posture.
            </div>
          )}
        </aside>
      </div>

      {/* Permissions Matrix */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Permissions</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{selectedWorker ? `${selectedWorker.name} access controls` : "Worker access controls"}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Permission</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {workerPermissions.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={4}>
                    No permission assignments available for this worker.
                  </td>
                </tr>
              ) : (
                workerPermissions.map((perm, idx) => (
                  <tr key={perm.id} className={idx !== workerPermissions.length - 1 ? "border-b border-slate-100" : ""}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-950">{perm.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{perm.resource}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{perm.action}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label="Granted" variant="approved" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
