"use client";

import { useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Copy, Eye, Plus, Trash2, Settings, Lock, Shield } from "lucide-react";

type APIKey = {
  id: string;
  name: string;
  key: string;
  masked: string;
  createdAt: string;
  lastUsed?: string;
  status: "active" | "revoked";
};

type Integration = {
  id: string;
  name: string;
  status: "connected" | "pending" | "disconnected";
  lastSync?: string;
  description: string;
};

export default function DeveloperSettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "key-1",
      name: "Production API Key",
      key: "whoa_sk_live_abc123def456ghi789jkl",
      masked: "whoa_sk_live_***...jkl",
      createdAt: "2026-05-15T10:30:00Z",
      lastUsed: "2026-05-31T14:32:00Z",
      status: "active",
    },
    {
      id: "key-2",
      name: "Development Key",
      key: "whoa_sk_test_xyz789uvw456rst123pqr",
      masked: "whoa_sk_test_***...pqr",
      createdAt: "2026-05-20T14:15:00Z",
      lastUsed: "2026-05-31T09:45:00Z",
      status: "active",
    },
  ]);

  const [integrations] = useState<Integration[]>([
    {
      id: "int-1",
      name: "Slack",
      status: "connected",
      lastSync: "2 hours ago",
      description: "Send decision notifications to Slack channels",
    },
    {
      id: "int-2",
      name: "Webhook",
      status: "connected",
      lastSync: "15 minutes ago",
      description: "Real-time event delivery to your infrastructure",
    },
    {
      id: "int-3",
      name: "DataDog",
      status: "pending",
      description: "Ingest metrics and logs to DataDog",
    },
    {
      id: "int-4",
      name: "Splunk",
      status: "disconnected",
      description: "Stream audit logs to Splunk for analysis",
    },
  ]);

  const [showKey, setShowKey] = useState<string | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `whoa_sk_live_${Math.random().toString(36).substring(2)}`,
      masked: `whoa_sk_live_***...${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    setApiKeys((current) => [newKey, ...current]);
    setNewKeyName("");
    setIsCreatingKey(false);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys((current) =>
      current.map((key) => (key.id === id ? { ...key, status: "revoked" } : key))
    );
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setTimeout(() => setShowKey(null), 1000);
  };

  return (
    <AppShell
      title="Developer Settings"
      description="API keys, integrations, and platform configuration."
    >
      <PageHeader
        title="Developer Settings"
        description="Manage API keys, webhooks, and third-party integrations for your WhoAI workspace."
      />

      <div className="space-y-6">
        {/* API Keys Section */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">API Access</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">API Keys</h2>
            </div>
            <button
              onClick={() => setIsCreatingKey(true)}
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Create key
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className={`rounded-3xl border p-4 ${
                  key.status === "active"
                    ? "border-slate-200 bg-white"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-950">{key.name}</p>
                    <p className="text-xs font-mono text-slate-600 mt-1">{key.masked}</p>
                  </div>
                  <StatusBadge
                    label={key.status === "active" ? "Active" : "Revoked"}
                    variant={key.status === "active" ? "approved" : "rejected"}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                  <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                  {key.lastUsed && <span>Last used {new Date(key.lastUsed).toLocaleString()}</span>}
                </div>

                <div className="flex gap-2">
                  {showKey === key.id ? (
                    <button
                      onClick={() => handleCopyKey(key.key)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 text-emerald-700 px-3 py-2 text-xs font-semibold hover:bg-emerald-200"
                    >
                      <Copy className="h-3 w-3" /> Copy to clipboard
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowKey(key.id)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-3 w-3" /> Reveal key
                    </button>
                  )}
                  <button
                    onClick={() => handleRevokeKey(key.id)}
                    disabled={key.status === "revoked"}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3 w-3" /> Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>

          {isCreatingKey && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g., Staging Environment)"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateKey}
                  className="flex-1 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreatingKey(false)}
                  className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Integrations */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Connections</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Integrations</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 hover:border-sky-300 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-950">{integration.name}</h3>
                  <StatusBadge
                    label={
                      integration.status === "connected"
                        ? "Connected"
                        : integration.status === "pending"
                        ? "Pending"
                        : "Disconnected"
                    }
                    variant={
                      integration.status === "connected"
                        ? "approved"
                        : integration.status === "pending"
                        ? "pending"
                        : "rejected"
                    }
                  />
                </div>

                <p className="text-xs text-slate-600 mb-3">{integration.description}</p>

                {integration.lastSync && (
                  <p className="text-xs text-slate-500 mb-3">Last sync: {integration.lastSync}</p>
                )}

                <button className="w-full rounded-2xl border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100">
                  {integration.status === "connected" ? "Manage" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Security Settings */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Security</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Security Settings</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">IP Whitelist</p>
                  <p className="text-xs text-slate-600">Restrict API access to specific IP addresses</p>
                </div>
              </div>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">
                Configure
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">API Rate Limits</p>
                  <p className="text-xs text-slate-600">Current: 10,000 req/min per key</p>
                </div>
              </div>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">
                Adjust
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Webhook Signing</p>
                  <p className="text-xs text-slate-600">Sign outgoing webhooks with HMAC-SHA256</p>
                </div>
              </div>
              <label className="flex h-6 w-10 items-center rounded-full bg-emerald-500 p-1 cursor-pointer">
                <div className="h-4 w-4 rounded-full bg-white transition-transform translate-x-4" />
              </label>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
