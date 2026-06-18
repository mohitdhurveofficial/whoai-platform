import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Fingerprint,
  FileCheck,
  Gauge,
  KeyRound,
  Lock,
  Minus,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Reveal,
  Stagger,
  StaggerItem,
  CountUp,
  MagneticButton,
} from "./components/marketing/Motion";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";
import { WhoaiTestimonials } from "@/components/ui/testimonials-columns";
import { ShaderAnimation } from "@/components/ui/shader-animation";

export const metadata: Metadata = {
  title: "WHOAI — The Control Plane for AI Spend",
  description:
    "WHOAI is the financial control plane for AI agents. Real-time per-token cost, hard budget enforcement, and an instant kill switch for runaway agents — across OpenAI, Anthropic, Gemini, and every major model. BYOK. OpenAI-compatible.",
  alternates: { canonical: "/" },
};

const PROVIDERS = [
  { name: "OpenAI", models: "GPT-5.5, GPT-5.4, o3, o4-mini, GPT-4o" },
  { name: "Anthropic", models: "Claude Opus 4.8, Claude 4 Sonnet, Claude 3.5 Sonnet" },
  { name: "Google", models: "Gemini 3.5 Flash, Gemini Spark, Gemini 2.5 Pro" },
  { name: "xAI", models: "Grok 3, Grok 2, Grok 2 Latest" },
  { name: "DeepSeek", models: "DeepSeek V4, DeepSeek Chat, DeepSeek Reasoner" },
  { name: "Meta", models: "Llama 4 Maverick, Llama 4 Scout, Llama 3.3 70B" },
  { name: "Alibaba", models: "Qwen 3.7 Max" },
  { name: "Mistral", models: "Mistral Large 2" },
];

const COMPARISON = [
  { label: "Real-time per-token, per-agent cost", whoai: "yes", obs: "partial", gw: "yes" },
  { label: "Hard budget caps that auto-pause", whoai: "yes", obs: "no", gw: "partial" },
  { label: "Instant runaway kill switch", whoai: "yes", obs: "no", gw: "no" },
  { label: "BYOK — no vendor lock-in", whoai: "yes", obs: "partial", gw: "partial" },
  { label: "Incentive-aligned (we profit when you spend less)", whoai: "yes", obs: "no", gw: "no" },
  { label: "Built for autonomous agents, not just chat", whoai: "yes", obs: "partial", gw: "partial" },
];

const FEATURES = [
  { icon: BarChart3, title: "Real-time cost monitoring", body: "Every dollar across every provider in one dashboard — daily, weekly, monthly, live." },
  { icon: Fingerprint, title: "Per-token attribution", body: "Exact prompt + completion tokens per request, per user, per agent. No averages." },
  { icon: ShieldAlert, title: "Budget enforcement", body: "Hard daily and monthly caps. The kill switch pauses any agent that exceeds its budget." },
  { icon: Activity, title: "Anomaly detection", body: "Catch a 400% spike against an agent's own baseline the moment it happens." },
  { icon: Zap, title: "Cost optimization", body: "Find duplicate prompts, cache hot queries, route to cheaper models — cut spend up to 30%." },
  { icon: ShieldCheck, title: "BYOK & secure", body: "Your keys, encrypted at rest, never ours. OpenAI-compatible — point your base URL and go." },
];

const FAQS = [
  { q: "What is an AI FinOps platform and why do I need one?", a: "An AI FinOps platform like WHOAI gives you real-time visibility into every dollar your AI agents spend on LLM APIs like OpenAI GPT-4o, Anthropic Claude, Gemini, Grok, and DeepSeek. Without it, autonomous agents can burn through budgets silently—costs spike 400% overnight and teams only find out when the monthly bill arrives." },
  { q: "How does WHOAI track AI cost per request?", a: "WHOAI intercepts every API call through a high-performance gateway, logging exact token counts (prompt + completion), model used, provider, latency, and precise cost in Decimal cents. You see real spend per agent, per request, per model—no averages, no estimates." },
  { q: "Which LLM providers does WHOAI support?", a: "WHOAI supports OpenAI (GPT-5.5, GPT-5.4, o3, o4-mini, GPT-4o), Anthropic (Claude Opus 4.8, Claude 4 Sonnet, Claude 3.5 Sonnet), Google (Gemini 3.5 Flash, Gemini Spark, Gemini 2.5 Pro), xAI Grok 3, DeepSeek V4, Meta Llama 4, Alibaba Qwen 3.7, and Mistral Large 2. New models are added within 48 hours of release." },
  { q: "What is BYOK and why does it matter for security?", a: "BYOK means Bring Your Own Key. Your organization keeps its own API credentials for every provider. WHOAI never stores or pays with its own keys—you control access, rotation, and revocation. This prevents vendor lock-in and keeps your data within your security perimeter." },
  { q: "How do budget controls and kill switches prevent runaway AI costs?", a: "Set hard daily and monthly spend limits per agent and per organization. WHOAI uses atomic budget pre-reservation: every request reserves its projected cost before execution. If a limit would be exceeded, the request is blocked instantly. The kill switch pauses the agent immediately—no runaway loops, no surprise bills." },
  { q: "Can WHOAI detect AI cost anomalies automatically?", a: "Yes. WHOAI monitors spend velocity, token burn rate, and request patterns in real time. If an agent suddenly spikes by 400% or behaves outside its historical baseline, you get an instant alert in Slack, Teams, or email—before the damage compounds." },
  { q: "How long does setup take?", a: "Most teams are live in under 5 minutes. Point your existing AI API calls at the WHOAI gateway, add your provider keys in Settings, and budgets start enforcing immediately. No code changes to your LLM prompts or agent logic." },
];

function Cell({ v }: { v: string }) {
  if (v === "yes") return <Check className="mx-auto h-5 w-5 text-[#0A8A5F]" />;
  if (v === "partial") return <Minus className="mx-auto h-5 w-5 text-[#B7791F]" />;
  return <span className="mx-auto block text-[#B0BAC9]">—</span>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0A2540] antialiased selection:bg-[#FF6B00] selection:text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#EEF1F6] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0A2540] text-[12px] font-black text-white">W</span>
            <span className="text-[16px] font-bold tracking-tight">WHOAI</span>
          </Link>
          <div className="hidden items-center gap-8 text-[14px] font-medium text-[#425466] md:flex">
            <Link href="/#features" className="transition-colors hover:text-[#0A2540]">Product</Link>
            <Link href="/pricing" className="transition-colors hover:text-[#0A2540]">Pricing</Link>
            <Link href="/docs" className="transition-colors hover:text-[#0A2540]">Docs</Link>
            <Link href="/security" className="transition-colors hover:text-[#0A2540]">Security</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden text-[14px] font-medium text-[#425466] transition-colors hover:text-[#0A2540] sm:block">Sign in</Link>
            <Link href="/auth/signup" className="rounded-lg bg-[#FF6B00] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#E85F00]">Start free</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO — WHOAI pixel-canvas hero (replaces the old hero + logos strip;
            the hero carries its own provider marquee) */}
        <PixelHero />

        {/* PRODUCT PREVIEW — the console */}
        <section className="bg-white pt-10 pb-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <Reveal className="mx-auto mb-12 max-w-[680px] text-center">
              <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[#FF6B00]">The console</p>
              <h2 className="text-[34px] font-bold tracking-[-0.02em] sm:text-[42px]">Watch every dollar, in real time</h2>
              <p className="mt-4 text-[18px] leading-relaxed text-[#425466]">Real-time spend, per-token attribution, and live budget enforcement — one control plane for every agent.</p>
            </Reveal>
            <Reveal delay={0.1} y={40} className="relative mx-auto max-w-[1000px]">
              {/* soft gradient glow beneath the product */}
              <div className="pointer-events-none absolute -inset-x-10 -bottom-8 top-12 rounded-[40px] bg-[linear-gradient(100deg,rgba(99,91,255,0.18),rgba(79,140,255,0.14)_45%,rgba(255,107,0,0.14))] blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-[#E6EBF1] bg-white text-left shadow-[0_50px_100px_-20px_rgba(10,37,64,0.25)]">
                <div className="flex items-center gap-2 border-b border-[#EEF1F6] bg-[#FBFCFE] px-5 py-3">
                  <span className="h-3 w-3 rounded-full bg-[#E6EBF1]" />
                  <span className="h-3 w-3 rounded-full bg-[#E6EBF1]" />
                  <span className="h-3 w-3 rounded-full bg-[#E6EBF1]" />
                  <span className="ml-3 font-mono text-[11px] text-[#8792A2]">whoai.ai/dashboard</span>
                  <span className="ml-auto rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8792A2]">Sample data</span>
                </div>
                <div className="grid gap-6 p-6 md:grid-cols-3">
                  <div className="space-y-6 md:col-span-2">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { k: "AI spend (30d)", value: 42842, prefix: "$", suffix: "", decimals: 0 },
                        { k: "Active agents", value: 124, prefix: "", suffix: "", decimals: 0 },
                        { k: "Tokens", value: 1.2, prefix: "", suffix: "B", decimals: 1 },
                      ].map((m) => (
                        <div key={m.k} className="rounded-xl border border-[#EEF1F6] bg-white p-4">
                          <p className="text-[11px] uppercase tracking-wide text-[#8792A2]">{m.k}</p>
                          <p className="mt-1.5 text-[22px] font-bold tabular-nums">
                            <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-[#0A8A5F]"><TrendingUp className="h-3 w-3" /> live</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                      <p className="mb-4 text-[13px] font-bold text-[#0A2540]">Spend velocity · last 14 days</p>
                      <svg viewBox="0 0 600 150" className="h-[150px] w-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,124 L46,116 L92,118 L138,100 L184,96 L230,100 L276,74 L322,70 L368,62 L414,48 L460,30 L506,36 L552,18 L600,10 L600,150 L0,150 Z" fill="url(#area)" />
                        <path className="wa-draw" d="M0,124 L46,116 L92,118 L138,100 L184,96 L230,100 L276,74 L322,70 L368,62 L414,48 L460,30 L506,36 L552,18 L600,10" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    <p className="mb-4 text-[13px] font-bold text-[#0A2540]">Live telemetry</p>
                    <div className="space-y-2.5">
                      {[
                        { id: "req_7x9a", v: "+2,401 tok", block: false },
                        { id: "req_8y2b", v: "+842 tok", block: false },
                        { id: "req_9z1c", v: "BLOCKED · budget", block: true },
                        { id: "req_a4d2", v: "+1,118 tok", block: false },
                      ].map((r) => (
                        <div key={r.id} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${r.block ? "border-[#FBD5D5] bg-[#FEF2F2]" : "border-[#EEF1F6] bg-[#FBFCFE]"}`}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${r.block ? "bg-[#DC2626]" : "bg-[#0A8A5F]"}`} />
                            <span className="font-mono text-[12px] text-[#697386]">{r.id}</span>
                          </div>
                          <span className={`font-mono text-[12px] font-medium ${r.block ? "text-[#DC2626]" : "text-[#0A2540]"}`}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="py-28">
          <div className="mx-auto max-w-[1100px] px-6">
            <Reveal className="mx-auto mb-16 max-w-[700px] text-center">
              <h2 className="text-[34px] font-bold tracking-[-0.02em] sm:text-[42px]">AI costs grow faster than teams can track</h2>
              <p className="mt-4 text-[18px] leading-relaxed text-[#425466]">Legacy billing dashboards weren&apos;t built for autonomous agents. You need real-time, agent-level control — before the bill arrives.</p>
            </Reveal>
            <Stagger className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Bot, t: "Runaway agents", b: "Autonomous agents get stuck in loops, burning thousands of tokens a minute with zero human oversight." },
                { icon: TrendingUp, t: "Silent token spikes", b: "One bloated context window spikes cost 400% in an hour. Finding the source takes days." },
                { icon: ShieldAlert, t: "Budget overruns", b: "By the time the monthly bill lands, the damage is done. You can't manage what you can't enforce." },
              ].map((c) => (
                <StaggerItem key={c.t} hover className="rounded-2xl border border-[#E6EBF1] bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]"><c.icon className="h-5 w-5" /></div>
                  <h3 className="text-[19px] font-bold">{c.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#425466]">{c.b}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="border-y border-[#EEF1F6] bg-[#FBFCFE] py-28">
          <div className="mx-auto max-w-[980px] px-6">
            <Reveal className="mx-auto mb-12 max-w-[680px] text-center">
              <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[#FF6B00]">Why WHOAI wins</p>
              <h2 className="text-[34px] font-bold tracking-[-0.02em] sm:text-[42px]">Observability shows you the bill. We enforce it.</h2>
            </Reveal>
            <Reveal delay={0.1} className="overflow-hidden rounded-2xl border border-[#E6EBF1] bg-white shadow-sm">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-b border-[#EEF1F6] bg-[#FBFCFE] px-5 py-4 text-[13px] font-semibold">
                <span className="text-[#697386]">Capability</span>
                <span className="text-center text-[#0A2540]">WHOAI</span>
                <span className="text-center text-[#8792A2]">Observability</span>
                <span className="text-center text-[#8792A2]">Gateways</span>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={row.label} className={`grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center px-5 py-4 text-[14px] ${i % 2 ? "bg-[#FBFCFE]" : ""}`}>
                  <span className="pr-3 text-[#425466]">{row.label}</span>
                  <span className="text-center"><Cell v={row.whoai} /></span>
                  <span className="text-center"><Cell v={row.obs} /></span>
                  <span className="text-center"><Cell v={row.gw} /></span>
                </div>
              ))}
            </Reveal>
            <p className="mt-4 text-center text-[12px] text-[#8792A2]">Based on each category&apos;s public positioning as of 2026.</p>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="scroll-mt-20 py-28">
          <div className="mx-auto max-w-[1100px] px-6">
            <Reveal className="mb-14 max-w-[640px]">
              <h2 className="text-[34px] font-bold tracking-[-0.02em] sm:text-[42px]">Everything you need to control AI spend</h2>
              <p className="mt-4 text-[18px] leading-relaxed text-[#425466]">One control plane, built from the ground up for the autonomous AI era.</p>
            </Reveal>
            <Stagger className="grid gap-6 md:grid-cols-3">
              {FEATURES.map((f) => (
                <StaggerItem key={f.title} hover className="rounded-2xl border border-[#E6EBF1] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]"><f.icon className="h-5 w-5" /></div>
                  <h3 className="text-[18px] font-bold">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#425466]">{f.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* STATS / OUTCOMES BAND */}
        <section className="border-y border-[#EEF1F6] bg-[#FBFCFE] py-16">
          <div className="mx-auto max-w-[1100px] px-6">
            <Stagger className="grid grid-cols-2 gap-8 md:grid-cols-4" stagger={0.08}>
              {[
                { value: 0, prefix: "$", suffix: "", decimals: 0, label: "Markup on tokens, ever — BYOK" },
                { value: 30, prefix: "", suffix: "%", decimals: 0, label: "Up to 30% lower AI spend" },
                { value: 5, prefix: "", suffix: " min", decimals: 0, label: "From signup to live" },
                { value: 8, prefix: "", suffix: "+", decimals: 0, label: "Major providers, one gateway" },
              ].map((s) => (
                <StaggerItem key={s.label} className="text-center">
                  <p className="text-[40px] font-bold tracking-tight tabular-nums text-[#0A2540] sm:text-[48px]">
                    <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                  </p>
                  <p className="mx-auto mt-2 max-w-[200px] text-[14px] font-medium leading-snug text-[#425466]">{s.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y border-[#EEF1F6] bg-[#FBFCFE] py-28">
          <div className="mx-auto max-w-[1000px] px-6">
            <Reveal className="mb-14 text-center">
              <h2 className="text-[34px] font-bold tracking-[-0.02em] sm:text-[42px]">Live in three steps</h2>
            </Reveal>
            <Stagger className="grid gap-6 md:grid-cols-3" stagger={0.12}>
              {[
                { icon: Bot, t: "Point your agents", b: "Change one base URL to the WHOAI gateway. No prompt or logic changes." },
                { icon: ShieldCheck, t: "We enforce", b: "Every request is metered, logged, budget-checked, and policy-enforced in real time." },
                { icon: Gauge, t: "You stay in control", b: "Watch live spend, get anomaly alerts, and auto-pause any agent that runs away." },
              ].map((s, i) => (
                <StaggerItem key={s.t} hover className="relative rounded-2xl border border-[#E6EBF1] bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                  <span className="absolute right-6 top-5 text-[40px] font-black text-[#F1F5F9]">{i + 1}</span>
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]"><s.icon className="h-5 w-5" /></div>
                  <h3 className="text-[18px] font-bold">{s.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#425466]">{s.b}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <WhoaiTestimonials />

        {/* PROVIDERS — SEO */}
        <section className="py-24" aria-label="Supported LLM Providers">
          <div className="mx-auto max-w-[1100px] px-6">
            <Reveal>
              <h2 className="text-center text-[28px] font-bold tracking-[-0.02em]">Supported AI models &amp; providers</h2>
              <p className="mx-auto mt-3 mb-10 max-w-[600px] text-center text-[15px] text-[#425466]">WHOAI tracks costs for every major LLM provider and model. New releases are added automatically.</p>
            </Reveal>
            <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4" stagger={0.05}>
              {PROVIDERS.map((p) => (
                <StaggerItem key={p.name} hover className="rounded-xl border border-[#E6EBF1] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <h3 className="text-[15px] font-bold">{p.name}</h3>
                  <p className="mt-1 text-[12px] text-[#8792A2]">{p.models}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* SECURITY & TRUST */}
        <section className="border-t border-[#EEF1F6] bg-white py-20">
          <div className="mx-auto max-w-[1100px] px-6">
            <Reveal className="text-center">
              <p className="mb-10 text-[12px] font-bold uppercase tracking-[0.16em] text-[#8792A2]">Security &amp; trust</p>
            </Reveal>
            <Stagger className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { icon: Lock, t: "Encryption everywhere", b: "TLS 1.2+ · secrets encrypted at rest" },
                { icon: KeyRound, t: "BYOK", b: "Your keys, your perimeter — never ours" },
                { icon: ShieldCheck, t: "Zero-retention option", b: "Gateway never persists prompts" },
                { icon: FileCheck, t: "SOC 2 in progress", b: "Enterprise & self-hosted VPC ready" },
              ].map((c) => (
                <StaggerItem key={c.t} hover className="flex flex-col items-center gap-3 rounded-2xl border border-[#E6EBF1] bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]"><c.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0A2540]">{c.t}</p>
                    <p className="mt-1 text-[12px] leading-snug text-[#8792A2]">{c.b}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1} className="mt-9 text-center">
              <Link href="/security" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#FF6B00] transition-colors hover:text-[#E85F00]">
                Read about our security <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-[#EEF1F6] bg-[#FBFCFE] py-24">
          <div className="mx-auto max-w-[800px] px-6">
            <Reveal>
              <h2 className="text-center text-[32px] font-bold tracking-[-0.02em]">Frequently asked questions</h2>
              <p className="mx-auto mt-3 mb-12 text-center text-[15px] text-[#425466]">Everything you need to know about tracking and controlling AI costs with WHOAI.</p>
            </Reveal>
            <Stagger className="space-y-4" stagger={0.06}>
              {FAQS.map((faq, i) => (
                <StaggerItem key={i}>
                  <details className="group rounded-xl border border-[#E6EBF1] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-semibold group-open:mb-3">
                      {faq.q}
                      <ChevronRight className="h-4 w-4 text-[#8792A2] transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="text-[15px] leading-relaxed text-[#425466]">{faq.a}</p>
                  </details>
                </StaggerItem>
              ))}
            </Stagger>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
                }),
              }}
            />
          </div>
        </section>

        {/* FINAL CTA — futuristic shader band */}
        <section className="relative overflow-hidden bg-[#070B14] py-36">
          {/* WebGL shader field (pauses off-screen) */}
          <ShaderAnimation className="absolute inset-0 h-full w-full opacity-60" />
          {/* legibility + vignette overlays */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,20,0.82)_68%,#070B14_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070B14] via-transparent to-[#070B14]" />
          <Reveal className="relative z-10 mx-auto max-w-[760px] px-6 text-center">
            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
              The control plane for the autonomous AI era
            </span>
            <h2 className="mt-6 text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-[54px]">Take control of your AI spend today.</h2>
            <p className="mx-auto mt-6 max-w-[520px] text-[18px] leading-relaxed text-white/70">Real-time cost, hard budget enforcement, and a kill switch for runaway agents. Set up in 5 minutes.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton href="/auth/signup" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-8 py-4 text-[16px] font-semibold text-white shadow-[0_12px_30px_rgba(255,107,0,0.35)] transition-colors hover:bg-[#E85F00] sm:w-auto">
                Start free <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton href="/teardown" className="inline-flex w-full items-center justify-center rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-[16px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 sm:w-auto">
                Get a free spend teardown
              </MagneticButton>
            </div>
          </Reveal>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#EEF1F6] bg-white py-16">
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-10 px-6 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#0A2540] text-[10px] font-black text-white">W</span>
              <span className="text-[15px] font-bold">WHOAI</span>
            </Link>
            <p className="mt-4 max-w-[260px] text-[14px] text-[#697386]">The financial control plane for the autonomous AI era. Track tokens, enforce budgets, stop runaway spend.</p>
          </div>
          {[
            { h: "Product", links: [["Features", "/#features"], ["Pricing", "/pricing"], ["Docs", "/docs"], ["Free teardown", "/teardown"]] },
            { h: "Company", links: [["About", "/about"], ["Security", "/security"], ["Trust", "/trust"], ["Contact", "/contact"]] },
            { h: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["DPA", "/legal/dpa"], ["Status", "/status"]] },
          ].map((col) => (
            <div key={col.h}>
              <h4 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#0A2540]">{col.h}</h4>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={href}><Link href={href} className="text-[14px] text-[#697386] transition-colors hover:text-[#0A2540]">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-[1100px] border-t border-[#EEF1F6] px-6 pt-6 text-[13px] text-[#8792A2]">© 2026 WHOAI Inc. All rights reserved.</div>
      </footer>
    </div>
  );
}
