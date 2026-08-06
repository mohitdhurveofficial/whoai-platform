"use client";

import Link from "next/link";
import { ArrowRight, Network, Layers, Gauge, Receipt, AlertTriangle } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/app/components/marketing/Motion";

/* -----------------------------------------------------------------------------
 * WHOAI MODEL CONTINUITY
 * Homepage section (navy/home palette) introducing the second launch pillar:
 * model-continuity risk. References the June 12 2026 export-control event once,
 * factually, as the proof point. Failover is described honestly as opt-in
 * (set a fallback), not automatic outage-detection.
 * -------------------------------------------------------------------------- */

const BULLETS = [
  {
    icon: Network,
    t: "Multi-provider, by design",
    b: "Adapters for OpenAI, Anthropic, Gemini, xAI, and DeepSeek ship in the gateway. Set a fallback provider so a failed call can route to a model you've already connected.",
  },
  {
    icon: Layers,
    t: "No single point of failure",
    b: "BYOK keeps your keys spread across providers, not locked to one. If a model goes dark, your agents have somewhere to go — because you wired the alternative before you needed it.",
  },
  {
    icon: Gauge,
    t: "Cost control never goes offline",
    b: "Failover doesn't suspend the guardrails. Hard budget caps and the instant kill switch keep enforcing in the path while traffic reroutes.",
  },
  {
    icon: Receipt,
    t: "Continuity as a line item, not a gamble",
    b: "Provider-concentration risk now has a price. Treat resilience like any other infrastructure cost — known, configured, and tested before the next surprise lands.",
  },
];

export function ModelContinuity() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-[1100px] px-6">
        <Reveal className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <div className="rounded-full border border-[#E6EBF1] bg-white px-4 py-1 text-[13px] font-semibold text-[#FF6B00] shadow-sm">
            Model-continuity risk
          </div>
          <h2 className="mt-5 text-[34px] font-bold tracking-[-0.02em] sm:text-[42px]">
            Don&apos;t let one model — or one bill — take you down.
          </h2>
          <p className="mt-4 text-[18px] leading-relaxed text-[#425466]">
            When the AI your product runs on lives behind a single provider, an outage, a price
            change, or a directive you don&apos;t control can strand you overnight. WHOAI is the layer
            that makes any single model disposable — route across every provider you&apos;ve connected,
            and keep the same hard budget caps and kill switch running the whole time.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mx-auto mt-8 flex max-w-[860px] items-start gap-3 rounded-2xl border border-[#FF6B00]/30 bg-[#FFF8F3] p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B00]" />
            <p className="text-[15px] leading-relaxed text-[#425466]">
              On June 12, 2026, a US export-control directive forced a frontier model offline
              worldwide overnight — every team built on it was stranded with no warning.
              Provider-concentration risk just stopped being theoretical.
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 md:grid-cols-2">
          {BULLETS.map((c) => (
            <StaggerItem
              key={c.t}
              hover
              className="rounded-2xl border border-[#E6EBF1] bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[19px] font-bold text-[#0A2540]">{c.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#425466]">{c.b}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/continuity"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(255,107,0,0.28)] transition-colors hover:bg-[#E85F00]"
          >
            See how continuity works <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/blog/model-continuity-after-the-export-control-shutdown"
            className="inline-flex items-center justify-center rounded-lg border border-[#E6EBF1] bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0A2540] shadow-sm transition-colors hover:border-[#CBD5E1]"
          >
            Read the announcement
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default ModelContinuity;
