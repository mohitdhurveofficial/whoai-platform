import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, value-based pricing for AI cost control. Growth, Enterprise Cloud, and self-hosted VPC plans.",
  alternates: { canonical: "/pricing" },
};

const TIERS = [
  {
    name: "Growth",
    price: "$2,000",
    cadence: "/ month",
    blurb: "For teams starting to scale internal AI agent usage.",
    cta: "Book a demo",
    href: "/demo",
    highlighted: false,
    features: [
      "High-performance AI gateway",
      "Real-time cost tracking & telemetry",
      "Spend by agent, model & team",
      "Basic spend alerts",
      "FinOps executive dashboards",
      "Up to 25 agents",
    ],
  },
  {
    name: "Enterprise Cloud",
    price: "$5k–$10k",
    cadence: "/ month",
    blurb: "For organizations with significant monthly token burn.",
    cta: "Talk to sales",
    href: "/demo",
    highlighted: true,
    features: [
      "Everything in Growth",
      "Automated budget controls & hard limits",
      "Instant kill switch for runaway agents",
      "Cost anomaly detection",
      "Organization RBAC & policy enforcement",
      "Unlimited agents",
      "Priority support",
    ],
  },
  {
    name: "On-Prem / VPC",
    price: "Custom",
    cadence: "",
    blurb: "For regulated industries needing strict data privacy.",
    cta: "Contact us",
    href: "/contact",
    highlighted: false,
    features: [
      "Everything in Enterprise Cloud",
      "Private VPC / self-hosted deployment",
      "Zero-data-retention gateway",
      "SSO & custom integrations",
      "Enterprise SLA & dedicated support",
    ],
  },
];

const FAQ = [
  {
    q: "How does WHOAI pay for itself?",
    a: "Most teams reduce AI spend 15–30% through visibility, anomaly prevention, and budget enforcement. Preventing a single runaway-agent incident often covers a year of WHOAI.",
  },
  {
    q: "Do you charge per seat?",
    a: "No. Pricing is based on capabilities and deployment model, not seat counts — your whole team can use WHOAI.",
  },
  {
    q: "Which providers are supported?",
    a: "OpenAI, Anthropic, Google Gemini, Azure OpenAI, and AWS Bedrock through a single gateway, with more added regularly.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — start a free trial to explore the dashboard, or book a demo for a guided walkthrough tailored to your stack.",
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
            Pricing
          </span>
          <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-extrabold tracking-tight mb-6">
            Pay for control, not headcount
          </h1>
          <p className="text-[18px] text-[#666666] leading-relaxed">
            Value-based plans that scale with your AI spend. Every plan includes the gateway,
            real-time cost analytics, and a 30-day onboarding.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                tier.highlighted
                  ? "border-[#FF6B00] bg-white shadow-xl shadow-[#FF6B00]/10 md:-translate-y-3"
                  : "border-[#EEE8E2] bg-white shadow-sm"
              }`}
            >
              {tier.highlighted && (
                <span className="self-start mb-4 inline-block rounded-full bg-[#FFF1E8] text-[#FF6B00] text-[11px] font-bold uppercase tracking-wider px-3 py-1">
                  Most popular
                </span>
              )}
              <h3 className="text-[20px] font-bold mb-2">{tier.name}</h3>
              <p className="text-[14px] text-[#666666] mb-6 min-h-[40px]">{tier.blurb}</p>
              <div className="mb-6">
                <span className="text-[36px] font-extrabold tracking-tight">{tier.price}</span>
                <span className="text-[15px] text-[#888888]">{tier.cadence}</span>
              </div>
              <Link
                href={tier.href}
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
          ))}
        </div>

        <div className="max-w-[760px] mx-auto mt-24">
          <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-[#EEE8E2] bg-white p-6">
                <h3 className="text-[16px] font-bold mb-2">{q}</h3>
                <p className="text-[15px] text-[#666666] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-20">
          <p className="text-[18px] font-semibold mb-4">Not sure which plan fits?</p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-7 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md"
          >
            Book a demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
