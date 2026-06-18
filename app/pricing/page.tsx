import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Server, Building2, KeyRound, ShieldCheck, Zap } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";
import { ROICalculator } from "./roi-calculator";
import {
  Reveal,
  Stagger,
  StaggerItem,
  CountUp,
  MagneticButton,
} from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, then $99/mo. Budget controls and kill switches for AI agents — bring your own provider keys. Self-serve Free, Starter, Growth, and Pro plans, plus Enterprise and self-hosted VPC.",
  alternates: { canonical: "/pricing" },
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "/ month",
    blurb: "Try WHOAI with no risk",
    cta: "Start free",
    highlighted: false,
    features: [
      "Bring your own keys (OpenAI, Anthropic & more)",
      "Real-time spend & token analytics",
      "Usage dashboards",
      "1 budget alert",
      "2 agents · 50k requests / mo",
      "7-day data retention",
    ],
  },
  {
    name: "Starter",
    price: "$99",
    cadence: "/ month",
    blurb: "Stop runaway agents before they burn your budget.",
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Everything in Free",
      "Budget controls & hard limits",
      "Instant kill switch for runaway agents",
      "Multi-provider routing",
      "10 agents · 1M requests / mo",
      "30-day retention · email support",
    ],
  },
  {
    name: "Growth",
    price: "$299",
    cadence: "/ month",
    blurb: "Governance and analytics for a fleet of agents in production.",
    cta: "Start free trial",
    highlighted: false,
    features: [
      "Everything in Starter",
      "Org RBAC & policy enforcement",
      "Cost anomaly detection",
      "Provider failover routing",
      "50 agents · 5M requests / mo",
      "90-day retention · priority support",
    ],
  },
  {
    name: "Pro",
    price: "$799",
    cadence: "/ month",
    blurb: "Mission-critical control once AI spend runs into five figures a month.",
    cta: "Start free trial",
    highlighted: false,
    features: [
      "Everything in Growth",
      "SSO (Google / Okta) & audit-log export",
      "Advanced governance policies",
      "Onboarding & solution support",
      "200 agents · 20M requests / mo",
      "180-day retention",
    ],
  },
];

const FAQ = [
  {
    q: "Do I pay WHOAI for model usage, or do you mark up tokens?",
    a: "Neither. WHOAI is bring-your-own-key (BYOK) — you connect your own OpenAI and Anthropic keys and pay those providers directly. Your WHOAI subscription covers the gateway, governance, and analytics only. We never mark up or resell tokens.",
  },
  {
    q: "When is WHOAI worth paying for?",
    a: "Once your agents are spending real money, a single runaway loop can burn thousands overnight. As a rule of thumb: Starter and Growth pay for themselves around $2k–10k/mo of AI spend; Pro and Enterprise are built for teams past ~$15k/mo, where the subscription is a small fraction of what one prevented incident saves.",
  },
  {
    q: "Is there really a free plan?",
    a: "Yes — Free is free forever, no credit card required. It's enough to instrument a couple of agents and see your spend. Upgrade when you need budget enforcement, more agents, or longer retention.",
  },
  {
    q: "What makes WHOAI different from observability tools?",
    a: "Most tools watch your spend after the fact. WHOAI sits in the path and can act — enforce hard budget limits and hit a kill switch the moment an agent goes haywire. That enforcement starts on the $99 Starter plan, not buried in an enterprise tier.",
  },
  {
    q: "Do you charge per seat?",
    a: "No. Plans are based on agents and usage, not headcount — your whole team can use WHOAI on any plan.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. Enterprise customers can deploy WHOAI in their own cloud or VPC, including air-gapped environments with a zero-data-retention gateway. Talk to us about a self-hosted plan.",
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

        {/* ROI Calculator */}
        <Reveal>
          <ROICalculator />
        </Reveal>

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-start" stagger={0.1}>
          {TIERS.map((tier) => (
            <StaggerItem key={tier.name} hover className="h-full">
              <div
                className={`rounded-2xl border p-7 flex flex-col h-full ${
                  tier.highlighted
                    ? "border-[#FF6B00] bg-white shadow-xl shadow-[#FF6B00]/10 lg:-translate-y-2"
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
                  <span className="text-[34px] font-extrabold tracking-tight tabular-nums">
                    <CountUp value={Number(tier.price.replace(/[^0-9.]/g, ""))} prefix="$" />
                  </span>
                  <span className="text-[15px] text-[#888888] ml-2">{tier.cadence}</span>
                </div>
                {tier.price !== "$0" && (
                  <div className="mt-2 inline-block text-[12px] bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-1 rounded">
                    Annual billing available — contact us
                  </div>
                )}
                <Link
                  href={`/auth/signup?plan=${tier.name.toLowerCase()}`}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-semibold text-[15px] transition-colors mb-8 ${
                    tier.highlighted
                      ? "bg-[#FF6B00] text-white hover:bg-[#E65A00] shadow-md"
                      : "bg-white border border-[#EEE8E2] text-[#111111] hover:border-[#DCD5CD]"
                  }`}
                >
                  {tier.cta} <ArrowRight className="h-4 w-4" />
                </Link>
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

        {/* Enterprise + On-prem bands — understated anchors, sales-led. */}
        <Stagger className="mt-6 grid md:grid-cols-2 gap-5">
          <StaggerItem hover className="rounded-2xl border border-[#EEE8E2] bg-white p-7 shadow-sm flex flex-col transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F3] flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <h3 className="text-[18px] font-bold">Enterprise</h3>
            </div>
            <p className="text-[14px] text-[#666666] mb-4 flex-1">
              For organizations running AI agents at scale. SAML SSO, unlimited agents, custom
              volume and retention, audit exports, dedicated support, and an SLA. Priced on AI
              spend under management — typically from $2,000/mo on an annual plan.
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
              Run the entire gateway inside your own cloud or air-gapped network with a
              zero-data-retention guarantee — for regulated teams where data can never leave the
              perimeter. Includes everything in Enterprise. Custom pricing.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-semibold text-[15px] bg-white border border-[#EEE8E2] text-[#111111] hover:border-[#DCD5CD] transition-colors"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </StaggerItem>
        </Stagger>

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