"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
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

  // Separate from the profile fetch: a failure here should not blank out the
  // name and slug fields, and vice versa.
  useEffect(() => {
    fetch("/api/settings/budget")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // 0 means "no cap set" — show it as empty rather than a literal 0,
        // which reads like a budget that blocks everything.
        if (data && Number(data.budget) > 0) setBudget(String(data.budget));
      })
      .catch(() => {
        /* The card stays empty and saving still works. */
      });
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

  const saveBudget = async () => {
    const parsed = budget.trim() === "" ? 0 : Number(budget);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setMessage({ type: "error", text: "Enter a monthly budget of 0 or more." });
      return;
    }
    setSavingBudget(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not save your budget." });
      } else {
        setMessage({
          type: "success",
          text: parsed > 0 ? `Monthly budget set to $${parsed}.` : "Monthly budget removed.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Could not save your budget." });
    } finally {
      setSavingBudget(false);
    }
  };

  const deleteWorkspace = async () => {
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/organization", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: deleteConfirmation.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not delete the workspace." });
        setDeleting(false);
        return;
      }
      // A full navigation, not router.push: every cached server component on
      // this session refers to an organization that no longer exists.
      window.location.href = "/auth/login?deleted=1";
    } catch {
      setMessage({ type: "error", text: "Could not delete the workspace." });
      setDeleting(false);
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

        <section className="overflow-hidden rounded-2xl border border-[#EEE8E2] bg-[#FAF7F3] shadow-[0_1px_2px_rgba(17,17,17,0.05)]">
          <div className="border-b border-[#EEE8E2] p-6">
            <h2 className="text-[16px] font-bold text-[#111111]">Monthly Budget</h2>
            <p className="mt-1 text-[13px] text-[#666666]">
              A hard spend cap across every agent in this workspace. Once the month&apos;s spend
              reaches it, the gateway refuses further requests instead of billing you more.
            </p>
          </div>
          <div className="p-6">
            <label
              htmlFor="monthly-budget"
              className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-[#888888]"
            >
              Budget (USD)
            </label>
            <div className="flex max-w-md items-center">
              <span className="rounded-l-md border border-r-0 border-[#EEE8E2] bg-[#FAF7F3] px-3 py-2 text-[13px] text-[#666]">
                $
              </span>
              <input
                id="monthly-budget"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                placeholder="No cap"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 rounded-r-md border border-[#EEE8E2] bg-white px-3 py-2 text-[13px] text-[#111111] transition-all focus-visible:border-[#FF6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#888888]">
              Leave empty or set 0 for no organization-wide cap. Per-agent limits are set on each
              agent and apply on top of this one.
            </p>
          </div>
          <div className="flex justify-end border-t border-[#EEE8E2] bg-white p-4">
            <button
              onClick={saveBudget}
              disabled={savingBudget}
              className="flex items-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#E65A00] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              {savingBudget ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Budget
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="overflow-hidden rounded-2xl border border-red-200 bg-[#FAF7F3] shadow-[0_1px_2px_rgba(17,17,17,0.05)]">
          <div className="p-6">
            <h2 className="text-[16px] font-bold text-red-600">Danger Zone</h2>
            <p className="mt-1 text-[13px] text-[#666666]">Irreversible and destructive actions.</p>

            <div className="mt-6 rounded-lg border border-red-200 bg-[#FF0000]/5 p-4">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-[14px] font-bold text-[#111111]">Delete Workspace</p>
                  <p className="mt-1 text-[13px] text-[#666666]">
                    Permanently deletes your workspace, agents, provider keys and all spend
                    history, and cancels your subscription. This cannot be undone.
                  </p>
                </div>
                {!confirmingDelete && (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="shrink-0 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  >
                    Delete workspace
                  </button>
                )}
              </div>

              {confirmingDelete && (
                <div className="mt-4 border-t border-red-200 pt-4">
                  <label
                    htmlFor="delete-confirmation"
                    className="block text-[13px] text-[#444444]"
                  >
                    Type <strong className="font-mono font-semibold">{slug}</strong> to confirm.
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="delete-confirmation"
                      type="text"
                      autoComplete="off"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="w-full max-w-xs rounded-md border border-red-200 bg-white px-3 py-2 font-mono text-[13px] text-[#111111] focus-visible:border-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                    />
                    <button
                      onClick={deleteWorkspace}
                      // Matching the slug is enforced server-side too; this
                      // only stops the request from being sent at all.
                      disabled={deleting || deleteConfirmation.trim().toLowerCase() !== slug.toLowerCase()}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    >
                      {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                      Delete permanently
                    </button>
                    <button
                      onClick={() => {
                        setConfirmingDelete(false);
                        setDeleteConfirmation("");
                      }}
                      disabled={deleting}
                      className="shrink-0 rounded-md border border-[#EEE8E2] bg-white px-4 py-2 text-[13px] font-semibold text-[#444444] transition-colors hover:border-[#DCD5CD] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
