import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Network, Layers, Gauge, Receipt } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";
import { Reveal, Stagger, StaggerItem, MagneticButton } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Model Continuity",
  description:
    "One directive can take a model offline overnight. WHOAI's multi-provider failover and BYOK make any single model survivable — without giving up hard budget caps or the kill switch. Configure a fallback before you need it.",
  alternates: { canonical: "/continuity" },
};

const HOW = [
  {
    icon: Network,
    t: "Multi-provider, by design",
    b: "The gateway ships adapters for OpenAI, Anthropic, Gemini, xAI, and DeepSeek. You connect the providers you want available.",
  },
  {
    icon: Layers,
    t: "Set a fallback before you need it",
    b: "Name a fallback provider and a failed call can route to a model you've already connected. It's opt-in and configured by you — not a black-box you have to trust blindly.",
  },
  {
    icon: Gauge,
    t: "Guardrails stay on",
    b: "Failover never suspends cost control. Hard budget caps and the instant kill switch keep enforcing in the path the whole time traffic reroutes.",
  },
  {
    icon: Receipt,
    t: "Tested, not hoped for",
    b: "Because you wire and verify the fallback up front, the resilience is real and predictable — not a promise you discover is empty during an outage.",
  },
];

export default function ContinuityPage() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="max-w-[900px] mx-auto px-6 pt-20 pb-12 text-center">
        <Reveal>
          <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
            Model-continuity risk
          </span>
          <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-extrabold tracking-tight mb-6">
            One directive can take a model offline overnight. Make sure it can&apos;t take you with it.
          </h1>
          <p className="text-[18px] text-[#666666] leading-relaxed max-w-[680px] mx-auto">
            Provider concentration just stopped being theoretical. WHOAI is the layer that makes any
            single model disposable — route across every provider you&apos;ve connected, keep your
            budget caps and kill switch enforcing the whole time, and stop betting your product on one
            vendor you don&apos;t control.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <MagneticButton
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-8 py-4 rounded-lg font-semibold text-[16px] hover:bg-[#E65A00] transition-colors shadow-md"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg border border-[#EEE8E2] bg-white px-8 py-4 font-semibold text-[16px] text-[#111111] hover:border-[#DCD5CD] transition-colors"
            >
              Book a demo
            </Link>
          </div>
        </Reveal>
      </section>

      {/* PROOF — the June 12 event, referenced once, factually */}
      <section className="max-w-[860px] mx-auto px-6 pb-8">
        <Reveal>
          <div className="flex items-start gap-3 rounded-2xl border border-[#FF6B00]/30 bg-[#FFF1E8] p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B00]" />
            <p className="text-[15px] leading-relaxed text-[#444444]">
              On June 12, 2026, a US export-control directive forced a frontier model offline
              worldwide overnight. Every team built on it was stranded with no warning — no migration
              window, no fallback, no notice. The lesson isn&apos;t about one model or one vendor: when
              your product runs on a single provider, events you don&apos;t control become your outage.
            </p>
          </div>
        </Reveal>
      </section>

      {/* SAME EXPOSURE, ONE ANSWER */}
      <section className="max-w-[800px] mx-auto px-6 py-14">
        <Reveal>
          <h2 className="text-[28px] md:text-[34px] font-extrabold tracking-tight mb-4">
            Same exposure, one answer
          </h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            A runaway agent burning your budget in an afternoon and a model vanishing overnight are
            the same problem wearing two masks: you don&apos;t fully control the AI your business runs
            on. WHOAI sits in front of every provider you&apos;ve connected as one control plane — it
            enforces a hard budget in the path (atomic pre-reservation before each call, not an alert
            after the bill lands) and lets you fail over to a backup provider you&apos;ve wired in
            advance. Cost and continuity, one platform.
          </p>
        </Reveal>
      </section>

      {/* HOW FAILOVER WORKS TODAY */}
      <section className="bg-[#FFFFFF] border-y border-[#EEE8E2]">
        <div className="max-w-[1100px] mx-auto px-6 py-16">
          <Reveal className="max-w-[680px] mb-10">
            <h2 className="text-[28px] md:text-[34px] font-extrabold tracking-tight mb-4">
              How continuity works today
            </h2>
            <p className="text-[16px] text-[#666666] leading-relaxed">
              Described honestly — this is shipped capability, configured by you, not magic.
            </p>
          </Reveal>
          <Stagger className="grid gap-6 md:grid-cols-2">
            {HOW.map((c) => (
              <StaggerItem
                key={c.t}
                hover
                className="rounded-2xl border border-[#EEE8E2] bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111111]">{c.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#666666]">{c.b}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <p className="mt-8 text-[14px] text-[#888888] leading-relaxed max-w-[760px]">
              BYOK means you connect your own keys for each provider, and WHOAI never marks up or
              resells tokens — we charge a subscription, so our incentives stay aligned with yours.
              True non-custody (per-tenant keys) is available on the self-hosted / VPC tier.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CONTINUITY AS A LINE ITEM */}
      <section className="max-w-[800px] mx-auto px-6 py-14">
        <Reveal>
          <h2 className="text-[28px] md:text-[34px] font-extrabold tracking-tight mb-4">
            Continuity as a line item, not a gamble
          </h2>
          <p className="text-[16px] text-[#666666] leading-relaxed">
            Treat model-continuity risk the way you treat any other infrastructure dependency: map
            which agents lean on a single model, connect a second provider, set a fallback, and test
            it. Provider-concentration risk now has a known price — the only mistake is leaving it off
            the books.
          </p>
        </Reveal>
      </section>

      {/* FINAL CTA BAND */}
      <section className="max-w-[1100px] mx-auto px-6 pb-20">
        <Reveal className="rounded-2xl bg-[#111111] px-8 py-14 text-center text-white">
          <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight mb-4">
            Name a fallback before you need it.
          </h2>
          <p className="text-[16px] text-white/70 leading-relaxed max-w-[560px] mx-auto mb-8">
            Start free, connect your providers, and make any single model survivable — without giving
            up your budget caps or kill switch.
          </p>
          <MagneticButton
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-8 py-4 rounded-lg font-semibold text-[16px] hover:bg-[#E65A00] transition-colors shadow-md"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </Reveal>
      </section>
    </MarketingShell>
  );
}
