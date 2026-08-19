import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Server, Building2, KeyRound, ShieldCheck, Zap } from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { ROICalculator } from "./roi-calculator";
import { TrustBadges } from "@/components/ui/trust-badges";
import { planConfig, planLimitsCopy } from "@/lib/subscription";
import {
  Reveal,
  Stagger,
  StaggerItem,
  CountUp,
  MagneticButton,
} from "@/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "The financial control plane for enterprise AI. Start free, then $149/mo. Budget enforcement and kill switches for AI agents — bring your own provider keys. Free, Starter, Growth and Business plans, plus Enterprise and self-hosted VPC.",
  alternates: { canonical: "/pricing" },
};

/**
 * Only the copy lives here. Agent counts, request allowances, retention windows
 * and prices are read from plans.json — the same file the gateway enforces —
 * so this page cannot advertise a limit the runtime does not honour.
 *
 * `support` is appended to the retention line where a tier has a support
 * commitment, keeping the card to a fixed number of bullets.
 */
const TIER_COPY = [
  {
    tier: "FREE",
    blurb: "Try WHOAI with no risk",
    continuity: "See your provider concentration — which agents lean on a single model.",
    cta: "Start free",
    highlighted: false,
    support: null,
    features: [
      "Bring your own keys (OpenAI, Anthropic & more)",
      "Real-time spend & token analytics",
      "Usage dashboards",
      "1 budget alert",
    ],
  },
  {
    tier: "STARTER",
    blurb: "Stop runaway agents before they burn your budget.",
    continuity:
      "Multi-provider routing — set a fallback so one model going dark can't take your agents down.",
    cta: "Start free trial",
    highlighted: false,
    support: "email support",
    features: [
      "Everything in Free",
      "Budget controls & hard limits",
      "Instant kill switch for runaway agents",
      "Multi-provider routing",
    ],
  },
  {
    tier: "GROWTH",
    blurb: "Governance and analytics for a fleet of agents in production.",
    continuity: "Provider failover routing across every provider you've connected.",
    cta: "Start free trial",
    highlighted: true,
    support: "priority support",
    features: [
      "Everything in Starter",
      "Cost anomaly detection",
      "Provider failover routing",
      "Org roles (RBAC) & policy enforcement",
      "Advanced analytics & spend attribution",
    ],
  },
  {
    tier: "BUSINESS",
    blurb: "For teams operating AI at scale.",
    continuity: "Continuity at fleet scale — failover plus governance for mission-critical agents.",
    cta: "Start free trial",
    highlighted: false,
    support: "priority support",
    features: [
      "Everything in Growth",
      "Advanced governance & policy controls",
      "Onboarding & solution support",
      // SSO and audit-log export are not built. Naming them as roadmap here
      // rather than as included features is the difference between a promise
      // and a lie — see plans.json `_implemented`.
      "SSO & audit-log export — coming soon",
    ],
  },
  {
    tier: "ENTERPRISE",
    blurb: "AI governance for organizations with custom security and deployment needs.",
    continuity: null,
    cta: "Talk to sales",
    highlighted: false,
    support: "dedicated support & SLA",
    features: [
      "Everything in Business",
      "Unlimited agents & custom volume",
      "VPC / self-hosted deployment",
      "SAML SSO, SCIM & audit exports — coming soon",
    ],
  },
] as const;

const TIERS = TIER_COPY.map((copy) => {
  const limits = planLimitsCopy(copy.tier);
  // ENTERPRISE is the only quote-based tier: plans.json gives it a null price,
  // and it is rendered as a card without a number and without a checkout link.
  const isCustomPriced = limits.price === null;
  return {
    ...copy,
    name: planConfig(copy.tier).label,
    isCustomPriced,
    price: limits.price ?? "Custom",
    cadence: isCustomPriced ? "pricing" : "/ month",
    features: [
      ...copy.features,
      limits.allowance,
      copy.support ? `${limits.retention} · ${copy.support}` : limits.retention,
    ],
  };
});

const FAQ = [
  {
    q: "Do I pay WHOAI for model usage, or do you mark up tokens?",
    a: "Neither. WHOAI is bring-your-own-key (BYOK) — you connect your own OpenAI and Anthropic keys and pay those providers directly. Your WHOAI subscription covers the gateway, governance, and analytics only. We never mark up or resell tokens.",
  },
  {
    q: "When is WHOAI worth paying for?",
    a: "Once your agents are spending real money, a single runaway loop can burn thousands overnight. As a rule of thumb: Starter and Growth pay for themselves around $2k–10k/mo of AI spend; Business and Enterprise are built for teams past ~$25k/mo, where the subscription is a small fraction of what one prevented incident saves.",
  },
  {
    q: "Is there really a free plan?",
    a: "Yes — Free is free forever, no credit card required. It's enough to instrument a couple of agents and see your spend. Upgrade when you need budget enforcement, more agents, or longer retention.",
  },
  {
    q: "What makes WHOAI different from observability tools?",
    a: "Most tools watch your spend after the fact. WHOAI sits in the path and can act — enforce hard budget limits and hit a kill switch the moment an agent goes haywire. That enforcement starts on the $149 Starter plan, not buried in an enterprise tier.",
  },
  {
    q: "Do you charge per seat?",
    a: "No. Plans are based on agents and usage, not headcount — your whole team can use WHOAI on any plan.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. Enterprise customers can deploy WHOAI in their own cloud or VPC, including air-gapped environments, so prompts and responses never leave your perimeter. It is a scoped engagement with our team rather than a self-serve install — engagements start at $30,000/year.",
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <Reveal className="text-center max-w-[720px] mx-auto mb-16">
          <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
            Pricing
          </span>
          <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-extrabold tracking-tight mb-6">
            Start free. Scale when you do.
          </h1>
          <p className="text-[18px] text-[#666666] leading-relaxed">
            Budget controls and kill switches for your AI agents — on your own provider keys.
            No token markup, no per-seat fees. Self-serve in minutes.
          </p>
        </Reveal>

        {/* TRUST STRIP — launch trust cues near the top-of-page CTA */}
        <Reveal className="mb-16">
          <TrustBadges />
        </Reveal>

        <Stagger
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start"
          stagger={0.1}
        >
          {TIERS.map((tier) => (
            <StaggerItem key={tier.name} hover className="h-full">
              <div
                className={`rounded-2xl border p-6 flex flex-col h-full ${
                  tier.highlighted
                    ? "border-[#FF6B00] bg-white shadow-xl shadow-[#FF6B00]/10 xl:-translate-y-2"
                    : tier.isCustomPriced
                      // Enterprise is sales-led, not a checkout tier — the tinted
                      // dashed card says that before anyone reads the button.
                      ? "border-dashed border-[#DCD5CD] bg-[#FAF7F3]"
                      : "border-[#EEE8E2] bg-white shadow-sm"
                }`}
              >
                {tier.highlighted && (
                  <span className="self-start mb-4 inline-block rounded-full bg-[#FFF1E8] text-[#FF6B00] text-[11px] font-bold uppercase tracking-wider px-3 py-1">
                    Most popular
                  </span>
                )}
                <h3 className="text-[20px] font-bold mb-2">{tier.name}</h3>
                <p className="text-[13px] text-[#666666] mb-6 min-h-[56px]">{tier.blurb}</p>
                <div className="mb-6 flex items-start">
                  {tier.isCustomPriced ? (
                    <span className="text-[34px] font-extrabold tracking-tight">Custom</span>
                  ) : (
                    <span className="text-[34px] font-extrabold tracking-tight tabular-nums">
                      <CountUp value={Number(tier.price.replace(/[^0-9.]/g, ""))} prefix="$" />
                    </span>
                  )}
                  <span className="text-[15px] text-[#888888] ml-2">{tier.cadence}</span>
                </div>
                {tier.price !== "$0" && !tier.isCustomPriced && (
                  <div className="mt-2 inline-block text-[12px] bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-1 rounded">
                    Annual billing available — contact us
                  </div>
                )}
                <Link
                  href={
                    tier.isCustomPriced ? "/demo" : `/auth/signup?plan=${tier.name.toLowerCase()}`
                  }
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-semibold text-[15px] transition-colors mb-8 ${
                    tier.highlighted
                      ? "bg-[#FF6B00] text-white hover:bg-[#E65A00] shadow-md"
                      : "bg-white border border-[#EEE8E2] text-[#111111] hover:border-[#DCD5CD]"
                  }`}
                >
                  {tier.cta} <ArrowRight className="h-4 w-4" />
                </Link>
                {tier.continuity && (
                  <div className="mb-6 -mt-2 flex items-start gap-2 rounded-lg bg-[#FFF1E8] px-3 py-2 text-[12px] leading-snug text-[#9A4A00]">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
                    <span>{tier.continuity}</span>
                  </div>
                )}
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px] text-[#444444]">
                      <Check className="h-4 w-4 text-[#047857] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="text-center text-[13px] text-[#888888] mt-6">
          All plans include the gateway, BYOK, and real-time spend analytics. Annual billing is
          available — contact us. You always pay your AI providers directly — WHOAI never marks up
          tokens.
        </p>

        {/* Founding customer offer — the real lever for the first cohort. */}
        <Reveal className="mt-8 rounded-2xl border border-[#FF6B00]/30 bg-[#FFF8F3] p-6 text-center">
          <p className="text-[15px] text-[#444444]">
            <span className="font-bold text-[#111111]">Founding customers:</span>{" "}
            we&rsquo;re onboarding a small first cohort at{" "}
            <span className="font-semibold text-[#FF6B00]">50% off for 12 months</span> in exchange
            for feedback and a short case study.{" "}
            <Link href="/demo" className="font-semibold text-[#FF6B00] hover:underline">
              Apply here →
            </Link>
          </p>
        </Reveal>

        {/* Enterprise + On-prem detail bands — the annual anchors behind the
            "Custom" card above. Both are sales-led, neither is self-serve. */}
        <Stagger className="mt-6 grid md:grid-cols-2 gap-5">
          <StaggerItem hover className="rounded-2xl border border-[#EEE8E2] bg-white p-7 shadow-sm flex flex-col transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F3] flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <h3 className="text-[18px] font-bold">Enterprise</h3>
            </div>
            <p className="text-[14px] text-[#666666] mb-4 flex-1">
              For organizations running AI agents at scale: unlimited agents, custom volume and
              retention, dedicated support, and an SLA. SAML SSO, SCIM and audit-log export are on
              the roadmap and scoped during onboarding — they are not shipping today. Priced on AI
              spend under management; engagements typically start around $25,000/year.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-semibold text-[15px] bg-white border border-[#EEE8E2] text-[#111111] hover:border-[#DCD5CD] transition-colors"
            >
              Talk to sales <ArrowRight className="h-4 w-4" />
            </Link>
          </StaggerItem>

          <StaggerItem hover className="rounded-2xl border border-[#EEE8E2] bg-white p-7 shadow-sm flex flex-col transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F3] flex items-center justify-center shrink-0">
                <Server className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <h3 className="text-[18px] font-bold">Self-Hosted / On-Prem (VPC)</h3>
            </div>
            <p className="text-[14px] text-[#666666] mb-4 flex-1">
              Run the gateway inside your own cloud or air-gapped network, so prompts and responses
              never leave your perimeter — for regulated teams. Deployed with our team as a scoped
              engagement rather than a self-serve install. Includes everything in Enterprise;
              engagements start at $30,000/year.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-semibold text-[15px] bg-white border border-[#EEE8E2] text-[#111111] hover:border-[#DCD5CD] transition-colors"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </StaggerItem>
        </Stagger>

        {/* ROI Calculator — moved below the plans so price-seekers see tiers
            first; this justifies the spend for those who want the math. */}
        <Reveal className="mt-20">
          <ROICalculator />
        </Reveal>

        {/* WHY WHOAI — honest, non-attributed proof points (no fabricated quotes) */}
        <Reveal className="mt-24 text-center">
          <p className="mb-8 text-[12px] font-bold uppercase tracking-[0.16em] text-[#8792A2]">
            Why teams choose WHOAI
          </p>
        </Reveal>
        <Stagger className="grid gap-5 md:grid-cols-3" stagger={0.08}>
          {[
            { icon: KeyRound, t: "$0 markup — BYOK", b: "Bring your own provider keys. They never leave your perimeter, and we never resell tokens — you pay OpenAI, Anthropic, and the rest directly." },
            { icon: ShieldCheck, t: "Enforcement, not just alerts", b: "Hard daily and monthly caps that actually pause an agent the moment it crosses the line, plus an instant kill switch for runaways." },
            { icon: Zap, t: "Live in 5 minutes", b: "Point one base URL at the WHOAI gateway. Every call is metered, logged, and budget-checked — no prompt or agent changes." },
          ].map((c) => (
            <StaggerItem
              key={c.t}
              hover
              className="rounded-2xl border border-[#EEE8E2] bg-white p-7 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FAF7F3] text-[#FF6B00]">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-[16px] font-bold text-[#111111]">{c.t}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-[#666666]">{c.b}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="max-w-[760px] mx-auto mt-24">
          <Reveal>
            <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-10">
              Frequently asked questions
            </h2>
          </Reveal>
          <Stagger className="space-y-6" stagger={0.06}>
            {FAQ.map(({ q, a }) => (
              <StaggerItem key={q} className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
                <h3 className="text-[16px] font-bold mb-2">{q}</h3>
                <p className="text-[15px] text-[#666666] leading-relaxed">{a}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Reveal className="text-center mt-20">
          <p className="text-[18px] font-semibold mb-4">Ready to see where your agent spend goes?</p>
          <MagneticButton
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-7 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </Reveal>
      </section>
    </MarketingShell>
  );
}