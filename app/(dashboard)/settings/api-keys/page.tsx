"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, Copy, Check, Trash2, Loader2, AlertTriangle } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  revoked: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Never";

/** Kept outside the component so the mount effect body is a plain promise
 *  chain rather than a call into a function that sets state. */
async function fetchKeys(): Promise<ApiKey[]> {
  const res = await fetch("/api/api-keys");
  if (!res.ok) throw new Error("Failed to load API keys");
  return res.json();
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  // The one and only time a key's plaintext is available (the server stores a
  // hash). Held until the user dismisses it.
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys()
      .then((data) => {
        setKeys(data);
        setError(null);
      })
      .catch(() => setError("Could not load API keys."))
      .finally(() => setLoading(false));
  }, []);

  /** Re-read the list after a create or revoke. */
  const reload = async () => {
    try {
      setKeys(await fetchKeys());
    } catch {
      setError("Could not load API keys.");
    }
  };

  const createKey = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() || "Default Key" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRevealedKey(data.apiKey);
      setNewKeyName("");
      setShowCreate(false);
      await reload();
    } catch {
      setError("Could not create API key.");
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string, name: string) => {
    if (!window.confirm(`Revoke "${name}"? Any service using this key will stop working immediately.`)) {
      return;
    }
    setRevoking(id);
    setError(null);
    try {
      const res = await fetch(`/api/api-keys?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await reload();
    } catch {
      setError("Could not revoke API key.");
    } finally {
      setRevoking(null);
    }
  };

  const copyKey = async () => {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#111111]">API Keys</h1>
          <p className="mt-1 text-[14px] text-[#666666]">
            Manage API keys for accessing the WHOAI Gateway.
          </p>
        </div>

        <button
          onClick={() => setShowCreate((open) => !open)}
          className="flex shrink-0 items-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#E65A00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </header>

      {revealedKey && (
        <div className="rounded-xl border border-[#FFD9C2] bg-[#FFF8F3] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-[#111111]">Copy this key now</p>
              <p className="mt-1 text-[13px] text-[#666666]">
                We store only a hash of it. Once you dismiss this, it cannot be shown again.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-md border border-[#EEE8E2] bg-white px-3 py-2 font-mono text-[13px] text-[#111111]">
                  {revealedKey}
                </code>
                <button
                  onClick={copyKey}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] font-medium text-[#111111] transition-colors hover:bg-[#FAF7F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setRevealedKey(null)}
                className="mt-3 text-[13px] font-semibold text-[#666666] underline-offset-2 hover:text-[#111111] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
              >
                I&apos;ve saved it — dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="rounded-xl border border-[#EEE8E2] bg-white p-4">
          <label htmlFor="key-name" className="block text-[13px] font-semibold text-[#111111]">
            Key name
          </label>
          <p className="mt-1 text-[13px] text-[#666666]">
            Name it after where it will be used, so you know what breaks if you revoke it.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !creating && createKey()}
              placeholder="Production Gateway"
              className="flex-1 rounded-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] text-[#111111] transition-colors focus-visible:border-[#FF6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30"
            />
            <button
              onClick={createKey}
              disabled={creating}
              className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#E65A00] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#EEE8E2] bg-[#FAF7F3] shadow-[0_1px_2px_rgba(17,17,17,0.04),0_12px_30px_-18px_rgba(17,17,17,0.16)]">
        <div className="flex items-center gap-3 border-b border-[#EEE8E2] p-6">
          <KeyRound className="h-5 w-5 text-[#FF6B00]" />
          <h2 className="text-[16px] font-bold text-[#111111]">Active Keys</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-[#EEE8E2] bg-white">
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Name</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Status</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Last used</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Created</th>
                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#666666]">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}

              {!loading &&
                keys.map((key) => (
                  <tr key={key.id} className="transition-colors hover:bg-white">
                    <td className="px-6 py-4 font-semibold text-[#111111]">{key.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-bold ${
                          key.revoked
                            ? "border-[#EEE8E2] bg-[#FAF7F3] text-[#888888]"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {key.revoked ? "Revoked" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#666666]">{formatDate(key.lastUsedAt)}</td>
                    <td className="px-6 py-4 text-[#666666]">{formatDate(key.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      {!key.revoked && (
                        <button
                          onClick={() => revokeKey(key.id, key.name)}
                          disabled={revoking === key.id}
                          aria-label={`Revoke ${key.name}`}
                          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium text-[#888888] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          {revoking === key.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

              {!loading && keys.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <KeyRound className="mx-auto mb-4 h-10 w-10 text-[#DCD5CD]" />
                    <h3 className="text-[16px] font-bold text-[#111111]">No API keys yet</h3>
                    <p className="mx-auto mt-1 max-w-sm text-[13px] text-[#666666]">
                      Create a key to start sending traffic through the WHOAI Gateway.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
