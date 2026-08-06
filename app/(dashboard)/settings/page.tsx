"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings/organization")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setName(data.name ?? "");
          setSlug(data.slug ?? "");
        } else {
          setMessage({ type: "error", text: "Could not load your workspace." });
        }
      })
      .catch(() => setMessage({ type: "error", text: "Could not load your workspace." }))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not save changes." });
      } else {
        setName(data.name);
        setSlug(data.slug);
        setMessage({ type: "success", text: "Changes saved." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not save changes." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#111111]">General Settings</h1>
          <p className="mt-1 text-[14px] text-[#666666]">Manage your workspace and organization profile.</p>
        </div>
      </header>

      {message && (
        <div
          className={`rounded-lg border p-3 text-[13px] font-medium ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-[#EEE8E2] bg-[#FAF7F3] shadow-[0_1px_2px_rgba(17,17,17,0.05)]">
          <div className="border-b border-[#EEE8E2] p-6">
            <h2 className="text-[16px] font-bold text-[#111111]">Organization Profile</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Update your workspace details and branding.</p>
          </div>
          <div className="space-y-6 p-6">
            <div>
              <label
                htmlFor="workspace-name"
                className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-[#888888]"
              >
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={name}
                disabled={loading}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-md rounded-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] text-[#111111] transition-all disabled:opacity-60 focus-visible:border-[#FF6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30"
              />
            </div>
            <div>
              <label
                htmlFor="workspace-slug"
                className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-[#888888]"
              >
                Workspace Slug
              </label>
              <div className="flex max-w-md items-center">
                <span className="rounded-l-md border border-r-0 border-[#EEE8E2] bg-[#FAF7F3] px-3 py-2 text-[13px] text-[#666]">
                  whoai.ai/
                </span>
                <input
                  id="workspace-slug"
                  type="text"
                  value={slug}
                  disabled={loading}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 rounded-r-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] text-[#111111] transition-all disabled:opacity-60 focus-visible:border-[#FF6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30"
                />
              </div>
              <p className="mt-2 text-[12px] text-[#888888]">
                Lowercase letters, numbers and hyphens only. Must be unique.
              </p>
            </div>
          </div>
          <div className="flex justify-end border-t border-[#EEE8E2] bg-white p-4">
            <button
              onClick={save}
              disabled={loading || saving}
              className="flex items-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#E65A00] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="overflow-hidden rounded-2xl border border-red-200 bg-[#FAF7F3] shadow-[0_1px_2px_rgba(17,17,17,0.05)]">
          <div className="p-6">
            <h2 className="text-[16px] font-bold text-red-600">Danger Zone</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Irreversible and destructive actions.</p>

            <div className="mt-6 flex flex-col justify-between gap-4 rounded-lg border border-red-200 bg-[#FF0000]/5 p-4 md:flex-row md:items-center">
              <div>
                <p className="text-[14px] font-bold text-[#111111]">Delete Workspace</p>
                <p className="mt-1 text-[13px] text-[#666666]">
                  Permanently deletes your workspace, agents, provider keys and all spend history.
                  Handled by support so we can confirm it with you first — it cannot be undone.
                </p>
              </div>
              <Link
                href="/contact?topic=delete-workspace"
                className="shrink-0 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Request deletion
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
