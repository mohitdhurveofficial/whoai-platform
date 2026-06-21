"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2, CreditCard } from "lucide-react";

// Plan ordering used to label a plan switch as an upgrade vs a downgrade.
const TIER_RANK: Record<string, number> = {
  FREE: 0,
  STARTER: 1,
  GROWTH: 2,
  PRO: 3,
  ENTERPRISE: 4,
};

type Subscription = {
  tier: string;
  label: string;
  status: string | null;
  currentPeriodEnd: string | null;
  hasBillingAccount: boolean;
  usage: { agents: number; maxAgents: number | null };
};

const PLANS = [
  { tier: "STARTER", label: "Starter", price: "$99/mo", blurb: "Budget controls + kill switches", agents: "10 agents" },
  { tier: "GROWTH", label: "Growth", price: "$299/mo", blurb: "RBAC, governance & anomaly detection", agents: "50 agents" },
  { tier: "PRO", label: "Pro", price: "$799/mo", blurb: "Scale governance, SSO & audit exports", agents: "200 agents" },
  { tier: "ENTERPRISE", label: "Enterprise", price: "Custom", blurb: "SAML SSO, SLA, unlimited & self-hosted", agents: "Unlimited" },
];

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  // Guards the one-shot auto-checkout when a user arrives from /pricing with ?plan=.
  const autoStartedRef = useRef(false);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSub(data);
        const params = new URLSearchParams(window.location.search);
        const planParam = params.get("plan")?.toUpperCase();
        const hasSuccess = !!params.get("success");
        const hasCanceled = !!params.get("canceled");

        if (hasSuccess) {
          setMessage({ type: "success", text: "Subscription updated. Thank you!" });
          // The Stripe webhook may lag a beat; poll briefly so the new tier
          // appears without a manual refresh.
          let tries = 0;
          const poll = () => {
            tries += 1;
            fetch("/api/billing/subscription")
              .then((res) => (res.ok ? res.json() : null))
              .then((fresh) => {
                if (fresh) setSub(fresh);
                const tier = (fresh?.tier ?? "FREE").toUpperCase();
                if (tier === "FREE" && tries < 5) setTimeout(poll, 2000);
              })
              .catch(() => {});
          };
          setTimeout(poll, 2000);
        } else if (hasCanceled) {
          setMessage({ type: "error", text: "Checkout canceled." });
        }

        // Arrived from the pricing page with a chosen plan → kick off Stripe
        // checkout automatically for paid tiers (skip if already on that plan).
        const paidTiers = ["STARTER", "GROWTH", "PRO"];
        const currentTier = (data?.tier ?? "FREE").toUpperCase();
        if (
          planParam &&
          paidTiers.includes(planParam) &&
          planParam !== currentTier &&
          !autoStartedRef.current
        ) {
          autoStartedRef.current = true;
          setWorking(planParam);
          fetch("/api/billing/create-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tier: planParam }),
          })
            .then((res) => res.json())
            .then((checkout) => {
              if (checkout?.url) {
                window.location.assign(checkout.url);
              } else {
                setWorking(null);
                setMessage({ type: "error", text: checkout?.error || "Could not start checkout." });
              }
            })
            .catch(() => {
              setWorking(null);
              setMessage({ type: "error", text: "Could not start checkout." });
            });
        }

        // Strip query params so a refresh can't re-trigger checkout or re-show
        // one-off messages (messages live in state, not the URL).
        if (planParam || hasSuccess || hasCanceled) {
          window.history.replaceState({}, "", "/billing");
        }
      })
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
        window.location.assign(data.url);
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
        window.location.assign(data.url);
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
      <div className="rounded-2xl border border-[#EEE8E2] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.05)]">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const isDowngrade = TIER_RANK[plan.tier] < (TIER_RANK[currentTier] ?? 0);
          // Enterprise is custom-priced — route to sales rather than self-serve checkout.
          const isContactSales = plan.tier === "ENTERPRISE";
          const actionLabel = isContactSales
            ? "Contact sales"
            : isDowngrade
              ? "Downgrade"
              : "Upgrade";
          return (
            <div
              key={plan.tier}
              className={`rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.05)] transition-all duration-200 hover:shadow-[0_2px_10px_rgba(17,17,17,0.08)] ${
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
              {isContactSales ? (
                <Link
                  href="/contact"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#111111] bg-[#111111] px-4 py-2 text-[14px] font-semibold text-white"
                >
                  Contact sales
                </Link>
              ) : (
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
                    actionLabel
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
