"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, CreditCard } from "lucide-react";

type Subscription = {
  tier: string;
  label: string;
  status: string | null;
  currentPeriodEnd: string | null;
  hasBillingAccount: boolean;
  usage: { agents: number; maxAgents: number | null };
};

const PLANS = [
  { tier: "STARTUP", label: "Startup", price: "$2,000/mo", blurb: "Up to 5 agents", agents: "5 agents" },
  { tier: "GROWTH", label: "Growth", price: "$5,000/mo", blurb: "Up to 25 agents", agents: "25 agents" },
  { tier: "ENTERPRISE", label: "Enterprise", price: "Custom", blurb: "Unlimited agents", agents: "Unlimited" },
];

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      setMessage({ type: "success", text: "Subscription updated. Thank you!" });
    } else if (params.get("canceled")) {
      setMessage({ type: "error", text: "Checkout canceled." });
    }

    fetch("/api/billing/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSub(data))
      .catch(() => setMessage({ type: "error", text: "Could not load subscription." }))
      .finally(() => setLoading(false));
  }, []);

  const startCheckout = async (tier: string) => {
    setWorking(tier);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error || "Could not start checkout." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not start checkout." });
    } finally {
      setWorking(null);
    }
  };

  const openPortal = async () => {
    setWorking("portal");
    setMessage(null);
    try {
      const res = await fetch("/api/billing/create-portal", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error || "Could not open billing portal." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not open billing portal." });
    } finally {
      setWorking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#666666]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading billing…
      </div>
    );
  }

  const currentTier = sub?.tier ?? "FREE";
  const renewal = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString()
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Billing</h1>
        <p className="mt-1 text-[14px] text-[#666666]">Manage your WHOAI subscription and plan.</p>
      </div>

      {message && (
        <div
          className={`rounded-md border p-3 text-[14px] ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-lg border border-[#EEE8E2] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wide text-[#666666]">
              Current Plan
            </span>
            <div className="mt-1 text-2xl font-bold text-[#111111]">{sub?.label ?? "Free"}</div>
            <div className="mt-1 text-[13px] text-[#666666]">
              Status: {sub?.status ?? "FREE"}
              {renewal ? ` · Renews ${renewal}` : ""}
            </div>
            <div className="mt-1 text-[13px] text-[#666666]">
              Agents: {sub?.usage.agents ?? 0}
              {sub?.usage.maxAgents != null ? ` / ${sub.usage.maxAgents}` : " / Unlimited"}
            </div>
          </div>
          {sub?.hasBillingAccount && (
            <button
              onClick={openPortal}
              disabled={working === "portal"}
              className="inline-flex items-center gap-2 rounded-md bg-[#111111] px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {working === "portal" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Manage Billing
            </button>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          return (
            <div
              key={plan.tier}
              className={`rounded-lg border bg-white p-5 shadow-sm ${
                isCurrent ? "border-[#FF6B00]" : "border-[#EEE8E2]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-[#111111]">{plan.label}</span>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#FF6B00]">
                    <CheckCircle className="h-3.5 w-3.5" /> Current
                  </span>
                )}
              </div>
              <div className="mt-3 text-2xl font-bold text-[#111111]">{plan.price}</div>
              <div className="mt-1 text-[13px] text-[#666666]">{plan.blurb}</div>
              <button
                onClick={() => startCheckout(plan.tier)}
                disabled={isCurrent || working === plan.tier}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {working === plan.tier ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Active"
                ) : (
                  "Upgrade"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
