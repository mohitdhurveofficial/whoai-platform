"use client";

import { useEffect, useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Plus, X, Lock } from "lucide-react";

type Permission = {
  id: string;
  action: string;
  resource: string;
  scope?: string;
  isGranted: boolean;
  createdAt: string;
};

type Agent = {
  id: string;
  name: string;
  role: string;
  department: string;
};

const ACTIONS = ["READ", "WRITE", "EXECUTE", "DELETE", "ADMIN"];
const RESOURCES = ["CRM", "EMAIL", "CUSTOMER_DATA", "PAYMENTS", "PRODUCTION", "INFRASTRUCTURE", "AUDIT_LOGS", "CUSTOM"];

export default function PermissionsPage() {
  const [workers, setWorkers] = useState<Agent[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [newPermission, setNewPermission] = useState({ action: "READ", resource: "CRM" });

  useEffect(() => {
    async function loadWorkers() {
      try {
        const response = await fetch("/api/ai-workers");
        if (!response.ok) throw new Error("Failed to load workers");
        const data: Agent[] = await response.json();
        setWorkers(data);
        if (data.length > 0) {
          setSelectedWorkerId(data[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkers();
  }, []);

  useEffect(() => {
    async function loadPermissions() {
      if (!selectedWorkerId) return;

      try {
        const response = await fetch(`/api/ai-workers/${selectedWorkerId}/permissions`);
        if (!response.ok) throw new Error("Failed to load permissions");
        const data: Permission[] = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPermissions();
  }, [selectedWorkerId]);

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);

  async function handleAddPermission() {
    if (!selectedWorkerId) return;

    try {
      const response = await fetch(`/api/ai-workers/${selectedWorkerId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPermission,
          isGranted: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to add permission");
      const created: Permission = await response.json();
      setPermissions((current) => [created, ...current]);
      setNewPermission({ action: "READ", resource: "CRM" });
      setIsAddingPermission(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRevokePermission(permission: Permission) {
    if (!selectedWorkerId) return;

    try {
      const response = await fetch(`/api/ai-workers/${selectedWorkerId}/permissions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: permission.action,
          resource: permission.resource,
        }),
      });

      if (!response.ok) throw new Error("Failed to revoke permission");
      setPermissions((current) => current.filter((p) => p.id !== permission.id));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AppShell
      title="AI Permissions Management"
      description="Define and enforce granular access controls for each AI worker across your infrastructure."
    >
      <PageHeader
        title="AI Permissions"
        description="Manage identity-based access control (IBAC) for autonomous AI workers."
      />

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Worker List */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Select Worker</p>
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-slate-600">Loading workers...</p>
            ) : workers.length === 0 ? (
              <p className="text-sm text-slate-600">No workers available.</p>
            ) : (
              workers.map((worker) => (
                <button
                  key={worker.id}
                  onClick={() => setSelectedWorkerId(worker.id)}
                  className={`w-full rounded-2xl border p-3 text-left text-sm transition ${
                    worker.id === selectedWorkerId
                      ? "border-sky-500 bg-sky-50 font-medium text-sky-900"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-medium">{worker.name}</p>
                  <p className="text-xs text-slate-600">{worker.department}</p>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Permissions Management */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Access Control</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {selectedWorker ? `${selectedWorker.name} permissions` : "Worker permissions"}
            </h2>
          </div>

          {selectedWorker ? (
            <>
              {/* Add Permission Form */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                {isAddingPermission ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Action</label>
                        <select
                          value={newPermission.action}
                          onChange={(e) => setNewPermission((p) => ({ ...p, action: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          {ACTIONS.map((action) => (
                            <option key={action} value={action}>
                              {action}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Resource</label>
                        <select
                          value={newPermission.resource}
                          onChange={(e) => setNewPermission((p) => ({ ...p, resource: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          {RESOURCES.map((resource) => (
                            <option key={resource} value={resource}>
                              {resource}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddPermission}
                        className="flex-1 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                      >
                        Grant
                      </button>
                      <button
                        onClick={() => setIsAddingPermission(false)}
                        className="flex-1 rounded-2xl bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingPermission(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    <Plus className="h-4 w-4" />
                    Grant permission
                  </button>
                )}
              </div>

              {/* Permissions List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-600">
                          No permissions granted yet. Add one to begin.
                        </td>
                      </tr>
                    ) : (
                      permissions.map((perm) => (
                        <tr key={perm.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-950">{perm.action}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{perm.resource}</td>
                          <td className="px-4 py-3">
                            <StatusBadge label={perm.isGranted ? "Granted" : "Revoked"} variant="approved" />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRevokePermission(perm)}
                              className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1"
                            >
                              <X className="h-4 w-4" /> Revoke
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <Lock className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">Select a worker to manage its permissions.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
