import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Eye, Gauge, Mail, ShieldCheck } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "About",
  description:
    "WHOAI is the cost observability and FinOps control plane for autonomous AI systems. Learn why we built it.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: Eye,
    title: "Visibility first",
    body: "You can't control what you can't see. Every token, every agent, every dollar — in real time.",
  },
  {
    icon: Gauge,
    title: "Control without friction",
    body: "Budgets, alerts, and a kill switch that protect spend without slowing your team down.",
  },
  {
    icon: ShieldCheck,
    title: "Built for trust",
    body: "Multi-tenant isolation, encryption, and a zero-retention gateway option for regulated teams.",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className="max-w-[820px] mx-auto px-6 py-20">
        <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
          About WHOAI
        </span>
        <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-extrabold tracking-tight mb-8">
          Turn experimental AI into profitable AI
        </h1>
        <div className="space-y-6 text-[18px] text-[#444444] leading-relaxed">
          <p>
            Autonomous AI agents now run workflows, process data, and call expensive models 24/7. When
            one gets stuck in a loop or quietly switches to a pricier model, the first sign is usually a
            shocking invoice at the end of the month.
          </p>
          <p>
            We built WHOAI to end that surprise. It&apos;s the cost observability and FinOps control plane
            for autonomous AI systems — think <strong>Google Analytics + Datadog for AI agents</strong>. It
            tracks every token, monitors every agent, and steps in the moment spending spikes.
          </p>
          <p>
            Our mission is simple: give every team complete visibility and control over their AI spend, so
            they can scale AI with confidence instead of fear.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-16">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-[#EEE8E2] bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-[16px] font-bold mb-2">{title}</h3>
              <p className="text-[14px] text-[#666666] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-[#EEE8E2] bg-white p-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] mb-5">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="text-[24px] font-bold tracking-tight mb-4">The company</h2>
          <div className="space-y-4 text-[16px] text-[#444444] leading-relaxed">
            <p>
              WHOAI is built and operated by <strong>WHOAI Inc.</strong> Our mission is to be the
              FinOps &amp; governance control plane for AI — helping teams track every token, enforce
              budgets, and stop runaway AI spend before it reaches the invoice.
            </p>
            <p>
              We started WHOAI after watching capable teams ship autonomous agents into production
              with no real way to see what they were spending until the bill arrived. Existing
              monitoring tools were built for human-driven traffic, not for agents that call
              expensive models on their own, around the clock. We set out to give every team the
              same visibility and guardrails over AI spend that they already expect from their cloud
              and infrastructure.
            </p>
          </div>
          <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pt-6 border-t border-[#EEE8E2]">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 font-semibold text-[15px] text-[#111111] hover:text-[#FF6B00] transition-colors"
            >
              Get in touch <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:founders@whoai.ai"
              className="inline-flex items-center gap-2 font-semibold text-[15px] text-[#666666] hover:text-[#FF6B00] transition-colors"
            >
              <Mail className="h-4 w-4" /> founders@whoai.ai
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#EEE8E2] bg-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-[20px] font-bold mb-1">See WHOAI for yourself</h2>
            <p className="text-[15px] text-[#666666]">A 30-minute walkthrough tailored to your stack.</p>
          </div>
          <Link
            href="/demo"
            className="shrink-0 inline-flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md"
          >
            Book a demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
