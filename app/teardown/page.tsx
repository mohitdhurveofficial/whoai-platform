import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  FileSearch,
  PiggyBank,
  XCircle,
  Copy,
  Gauge,
  ShieldCheck,
  Clock,
} from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";
import { Reveal, Stagger, StaggerItem } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Free AI Spend Teardown",
  description:
    "Send us a sample of your AI usage logs and we'll show you exactly where 15–30% of your model spend is wasted — failed calls, duplicate prompts, and over-powered models. No integration. If the savings aren't worth it, you pay nothing.",
  alternates: { canonical: "/teardown" },
};

// Pre-filled email so the prospect's only job is to attach a file.
const MAILTO =
  "mailto:founders@whoai.ai" +
  "?subject=" +
  encodeURIComponent("AI Spend Teardown — [Company]") +
  "&body=" +
  encodeURIComponent(
    [
      "Hi WHOAI team,",
      "",
      "We'd like a free teardown of our AI spend.",
      "",
      "Company:",
      "Roughly what we spend on AI per month:",
      "Providers we use (OpenAI / Anthropic / Gemini / other):",
      "",
      "Attached is a sample of our usage logs (model, tokens, status per call).",
      "If it's easier, our provider usage export works too.",
      "",
      "Thanks!",
    ].join("\n")
  );

const STEPS = [
  {
    icon: Upload,
    title: "1. Send a sample",
    body: "Email us a slice of your AI usage logs — model, tokens, and status per call. Takes you five minutes. Nothing routes through us; it's read-only.",
  },
  {
    icon: FileSearch,
    title: "2. We tear it down",
    body: "Within 48 hours we analyse every call against live model pricing and pinpoint exactly where the money leaks — with the dollar figure on each.",
  },
  {
    icon: PiggyBank,
    title: "3. You get the number",
    body: "A clear report: total spend, recoverable spend, and the specific fixes. If the savings aren't worth our fee, you owe nothing.",
  },
];

const FINDINGS = [
  {
    icon: XCircle,
    title: "Failed-call waste",
    body: "You pay for tokens even when calls error — and naive retry loops multiply it. We total exactly what failures cost you.",
  },
  {
    icon: Copy,
    title: "Duplicate prompts",
    body: "Identical requests sent over and over are fully cacheable. We count every repeat and what caching would save.",
  },
  {
    icon: Gauge,
    title: "Over-powered models",
    body: "Flagship models answering one-word questions. We flag every short call that a cheaper sibling handles — with the swap and the saving.",
  },
];

export default function TeardownPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="max-w-[1000px] mx-auto px-6 pt-20 pb-16 text-center">
        <Reveal>
          <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-5">
            Free AI Spend Teardown
          </span>
          <h1 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-tight mb-6">
            Find out how much AI spend
            <br className="hidden md:block" /> you&apos;re wasting — free.
          </h1>
          <p className="text-[19px] text-[#666666] max-w-[640px] mx-auto mb-10 leading-relaxed">
            Most teams running AI agents waste <strong className="text-[#111111]">15–30%</strong> of
            their model spend on failed calls, duplicate prompts, and over-powered models. Send us a
            sample of your usage and we&apos;ll show you exactly where — to the dollar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={MAILTO}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-[#E65A00] transition-colors"
            >
              Send my logs <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-[#DCD5CD] px-7 py-3.5 text-[15px] font-semibold text-[#111111] hover:border-[#B3B3B3] transition-colors"
            >
              Ask a question
            </Link>
          </div>
          <p className="mt-5 text-[13px] text-[#888888]">
            No integration · read-only · no payment to see your report
          </p>
        </Reveal>
      </section>

      {/* Risk reversal banner */}
      <section className="max-w-[1000px] mx-auto px-6 pb-16">
        <Reveal className="rounded-2xl bg-[#111111] text-white px-8 py-10 text-center">
          <ShieldCheck className="h-8 w-8 text-[#FF6B00] mx-auto mb-4" />
          <p className="text-[22px] md:text-[26px] font-bold leading-snug max-w-[680px] mx-auto">
            If we don&apos;t find savings worth more than our fee, you pay nothing.
          </p>
          <p className="text-[15px] text-[#AAAAAA] mt-3">
            The risk is entirely ours. You only pay once the savings are on the table.
          </p>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="max-w-[1100px] mx-auto px-6 pb-16">
        <Reveal>
          <h2 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-center mb-12">
            How it works
          </h2>
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title} hover className="rounded-xl border border-[#EEE8E2] bg-white p-7 transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] mb-5">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-[18px] font-bold mb-2">{title}</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* What we find */}
      <section className="max-w-[1100px] mx-auto px-6 pb-16">
        <Reveal>
          <h2 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-center mb-3">
            What we find
          </h2>
          <p className="text-[16px] text-[#666666] text-center max-w-[560px] mx-auto mb-12">
            Three leaks hide in almost every AI bill. Each one becomes a line item with a dollar figure
            in your report.
          </p>
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-6">
          {FINDINGS.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title} hover className="rounded-xl border border-[#EEE8E2] bg-white p-7 transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] mb-5">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-[18px] font-bold mb-2">{title}</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* The offer / what happens next */}
      <section className="max-w-[820px] mx-auto px-6 pb-16">
        <Reveal className="rounded-2xl border border-[#EEE8E2] bg-white p-8 md:p-10">
          <h2 className="text-[26px] md:text-[30px] font-extrabold tracking-tight mb-8">
            From teardown to permanent savings
          </h2>
          <Stagger className="space-y-6">
            <StaggerItem>
              <Tier
                tag="Step 1 · Free"
                title="The Teardown"
                price="$0"
                body="We analyse your usage and deliver the report. No cost, no commitment, no integration."
              />
            </StaggerItem>
            <StaggerItem>
              <Tier
                tag="Step 2 · One-time"
                title="Teardown + Setup"
                price="$2,000"
                body="We implement the fixes on your stack — cheaper-model routing, retry guards, caching, and budget guardrails — and verify the savings are real."
                ctaHref="/checkout"
                ctaLabel="Get Teardown + Setup"
              />
            </StaggerItem>
            <StaggerItem>
              <Tier
                tag="Step 3 · Ongoing"
                title="Growth ($299/mo)"
                price="$299/mo"
                body="We keep the fixes enforced continuously: hard budget caps, auto-pause on runaway agents, and a kill-switch so a looping agent can never burn your budget overnight."
              />
            </StaggerItem>
          </Stagger>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="max-w-[820px] mx-auto px-6 pb-24 text-center">
        <Reveal>
          <Clock className="h-7 w-7 text-[#FF6B00] mx-auto mb-4" />
          <h2 className="text-[28px] md:text-[34px] font-extrabold tracking-tight mb-4">
            See your number this week
          </h2>
          <p className="text-[17px] text-[#666666] max-w-[560px] mx-auto mb-8 leading-relaxed">
            Five minutes to send a sample. Forty-eight hours to your report. Nothing to lose but the
            spend you didn&apos;t know you were wasting.
          </p>
          <a
            href={MAILTO}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-8 py-4 text-[16px] font-semibold text-white hover:bg-[#E65A00] transition-colors"
          >
            Send my logs <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>
      </section>
    </MarketingShell>
  );
}

function Tier({
  tag,
  title,
  price,
  body,
  ctaHref,
  ctaLabel,
}: {
  tag: string;
  title: string;
  price: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-l-2 border-[#FF6B00] pl-5">
      <div className="sm:w-[160px] shrink-0">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[#888888]">{tag}</p>
        <p className="text-[18px] font-bold">{title}</p>
        <p className="text-[20px] font-extrabold text-[#FF6B00]">{price}</p>
      </div>
      <div className="flex-1">
        <p className="text-[15px] text-[#666666] leading-relaxed">{body}</p>
        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#E65A00] transition-colors"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
