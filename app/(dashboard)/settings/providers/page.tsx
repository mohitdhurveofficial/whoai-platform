"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Trash2, Loader2, Plug } from "lucide-react";

type Provider = {
  id: string;
  provider: string;
  status: string;
  maskedKey: string | null;
  lastTestedAt: string | null;
};

const PROVIDERS = [
  { id: "openai", name: "OpenAI", logo: "🟢" },
  { id: "anthropic", name: "Anthropic", logo: "🟣" },
  { id: "gemini", name: "Google Gemini", logo: "🔵" },
  { id: "grok", name: "xAI Grok", logo: "✖️" },
  { id: "deepseek", name: "DeepSeek", logo: "🐋" },
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [keys, setKeys] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/settings/providers");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/settings/providers");
        if (res.ok) {
          const data = await res.json();
          if (active) setProviders(data.providers || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (providerId: string) => {
    const key = keys[providerId];
    if (!key) return;

    setSaving(providerId);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId, apiKey: key }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `${providerId} key saved successfully.` });
        setKeys((prev) => ({ ...prev, [providerId]: "" }));
        fetchProviders();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save key." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to save key." });
    } finally {
      setSaving(null);
    }
  };

  const handleTest = async (providerId: string) => {
    setTesting(providerId);
    setMessage(null);
    try {
      const res = await fetch(`/api/settings/providers/${providerId}/test`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMessage({ type: "success", text: `${providerId} connection verified.` });
      } else {
        setMessage({
          type: "error",
          text: data.detail || data.error || `${providerId} connection failed.`,
        });
      }
      fetchProviders();
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Connection test failed." });
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!confirm("Are you sure you want to remove this key?")) return;
    
    setSaving(providerId);
    try {
      const res = await fetch(`/api/settings/providers/${providerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProviders();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete key." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to delete key." });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-[#666]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[#111111] mb-2">AI Providers</h3>
        <p className="text-[#666666] text-[14px]">
          Connect your organization to supported AI providers. Your keys are securely encrypted at rest.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-md text-[14px] flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {PROVIDERS.map((provider) => {
          const config = providers.find((p) => p.provider === provider.id);
          const isConnected = !!config;
          const status = config?.status;

          return (
            <div key={provider.id} className="p-5 border border-[#EEE8E2] rounded-lg bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F3] flex items-center justify-center text-xl">
                  {provider.logo}
                </div>
                <div>
                  <h4 className="text-[#111111] font-medium text-[15px]">{provider.name}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {!isConnected ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#888888] bg-[#FAF7F3] px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#666]"></span> Not Configured
                      </span>
                    ) : status === "DISCONNECTED" ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Disconnected
                      </span>
                    ) : config?.lastTestedAt ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Not tested
                      </span>
                    )}
                    {config?.maskedKey && (
                      <span className="text-[12px] text-[#888888] font-mono">{config.maskedKey}</span>
                    )}
                    {config?.lastTestedAt && (
                      <span className="text-[11px] text-[#999999]">
                        tested {new Date(config.lastTestedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="password"
                  placeholder={isConnected ? "••••••••••••••••" : "Enter API Key"}
                  value={keys[provider.id] || ""}
                  onChange={(e) => setKeys({ ...keys, [provider.id]: e.target.value })}
                  className="bg-[#FAF7F3] border border-[#EEE8E2] text-[#111111] text-[14px] rounded-md px-3 py-2 w-full md:w-64 focus:outline-none focus:border-[#FF6B00] placeholder-[#999]"
                />

                <button
                  onClick={() => handleSave(provider.id)}
                  disabled={!keys[provider.id] || saving === provider.id}
                  className="bg-[#FF6B00] hover:bg-[#E65A00] text-white disabled:opacity-50 px-4 py-2 rounded-md text-[14px] font-medium transition-colors min-w-[80px] flex justify-center"
                >
                  {saving === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (isConnected ? "Update" : "Save")}
                </button>

                {isConnected && (
                  <>
                    <button
                      onClick={() => handleTest(provider.id)}
                      disabled={testing === provider.id}
                      title="Test connection"
                      className="flex items-center gap-1.5 border border-[#EEE8E2] text-[#444] hover:border-[#FF6B00] hover:text-[#FF6B00] disabled:opacity-50 px-3 py-2 rounded-md text-[14px] font-medium transition-colors min-w-[88px] justify-center"
                    >
                      {testing === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plug className="w-4 h-4" /> Test</>}
                    </button>
                    <button
                      onClick={() => handleDelete(provider.id)}
                      disabled={saving === provider.id}
                      className="p-2 text-[#888] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
