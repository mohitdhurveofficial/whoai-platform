import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  Users,
  Zap,
} from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";
import { Reveal, Stagger, StaggerItem, MagneticButton } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Trust Center",
  description:
    "WHOAI's commitment to security, privacy, and transparency. Learn how we protect your data and AI spend.",
  alternates: { canonical: "/trust" },
};

export default function TrustPage() {
  return (
    <MarketingShell>
    <div className="max-w-[1200px] mx-auto px-6 py-20">
      <Reveal className="text-center max-w-[720px] mx-auto mb-16">
        <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
          Trust & Security
        </span>
        <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-extrabold tracking-tight mb-6">
          Built for trust, designed for transparency
        </h1>
        <p className="text-[18px] text-[#666666] leading-relaxed">
          Your AI spend and data deserve enterprise-grade protection. We never see your keys,
          never mark up tokens, and give you full control over your AI gateway.
        </p>
      </Reveal>

      <section className="mb-16">
        <Reveal>
          <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-12">
            How WHOAI Protects Your AI Spend
          </h2>
        </Reveal>
        <Stagger className="grid gap-8 md:grid-cols-2">
          {/* Data Flow */}
          <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#FF6B00]" /> Secure Data Flow
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              All AI requests flow through our encrypted gateway. We log, enforce budgets,
              and forward to your providers. On Enterprise and VPC plans, the gateway can
              forward prompts without persisting payloads — so sensitive content never lands
              in WHOAI storage.
            </p>
            <div className="text-[13px] text-[#888888]">
              <span className="font-medium">Your App</span> &rarr;
              <span className="font-medium">WHOAI Gateway (Encrypted)</span> &rarr;
              <span className="font-medium">Your AI Provider (OpenAI, Anthropic, etc.)</span>
            </div>
          </StaggerItem>

          {/* Encryption */}
          <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#FF6B00]" /> Encryption Everywhere
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              Data at rest is encrypted with industry-standard algorithms. Data in transit
              uses TLS 1.2+. Your provider keys are encrypted at rest and never exposed in
              logs or APIs.
            </p>
          </StaggerItem>
        </Stagger>
      </section>

      <section className="mb-16">
        <Reveal>
          <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-12">
            Key Management & Control
          </h2>
        </Reveal>
        <Stagger className="grid gap-8 md:grid-cols-2">
          {/* Key Management */}
          <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-[#FF6B00]" /> Bring Your Own Keys (BYOK)
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              You connect your own OpenAI, Anthropic, and other provider keys.
              WHOAI only serves as a secure gateway — we never resell or markup tokens.
            </p>
          </StaggerItem>

          {/* Log Storage */}
          <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#FF6B00]" /> Tamper-Evident Logging
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              All gateway decisions are append-only logged with hash chaining.
              Export audit logs as JSON or CSV for compliance and forensics.
            </p>
          </StaggerItem>
        </Stagger>
      </section>

      <section className="mb-16">
        <Reveal>
          <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-12">
            Access & Governance
          </h2>
        </Reveal>
        <Stagger className="grid gap-8 md:grid-cols-2">
          {/* Access Controls */}
          <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#FF6B00]" /> Role-Based Access Control
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              Assign Admin or User roles to team members. Admins manage keys,
              budgets, and alerts. Users view spend and agent activity.
            </p>
          </StaggerItem>

          {/* API Security */}
          <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FF6B00]" /> Secure API Access
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              Every request to the WHOAI API is authenticated and authorized.
              API keys are scoped to organizations and can be rotated instantly.
            </p>
          </StaggerItem>
        </Stagger>
      </section>

      <Reveal className="mb-16 bg-[#FAF7F3] rounded-xl border border-[#EEE8E2] p-8">
        <h2 className="text-[24px] font-bold text-center mb-6">
          SOC 2 Type II & Compliance
        </h2>
        <p className="text-[15px] text-[#666666] text-center mb-6">
          We are actively pursuing SOC 2 Type II certification. Our controls
          align with ISO 27001, GDPR, and CCPA requirements for data protection.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/security"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-semibold text-[15px] border border-[#EEE8E2] text-[#111111] hover:border-[#DCD5CD] transition-colors"
          >
            Security Details
          </Link>
          <Link
            href="/legal/dpa"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-semibold text-[15px] bg-white border border-[#EEE8E2] text-[#111111] hover:border-[#DCD5CD] transition-colors"
          >
            View DPA
          </Link>
        </div>
      </Reveal>

      <section className="mb-16">
        <Reveal>
          <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-12">
            Subprocessors & Transparency
          </h2>
        </Reveal>
        <Stagger className="grid gap-4 md:grid-cols-3">
          <StaggerItem hover className="rounded-lg border border-[#EEE8E2] bg-white p-4 transition-shadow hover:shadow-md">
            <p className="text-[14px] font-medium text-[#111111]">Vercel</p>
            <p className="text-[13px] text-[#666666]">Hosting & CDN</p>
          </StaggerItem>
          <StaggerItem hover className="rounded-lg border border-[#EEE8E2] bg-white p-4 transition-shadow hover:shadow-md">
            <p className="text-[14px] font-medium text-[#111111]">Supabase</p>
            <p className="text-[13px] text-[#666666]">Database & Auth</p>
          </StaggerItem>
          <StaggerItem hover className="rounded-lg border border-[#EEE8E2] bg-white p-4 transition-shadow hover:shadow-md">
            <p className="text-[14px] font-medium text-[#111111]">Stripe</p>
            <p className="text-[13px] text-[#666666]">Payments & Billing</p>
          </StaggerItem>
        </Stagger>
        <p className="text-[13px] text-[#666666] mt-4 text-center">
          We subprocess only essential infrastructure providers. No prompt or response
          content is shared with subprocessors for model/AI processing — your keys remain
          strictly within your control.
        </p>
      </section>

      <Reveal className="text-center mt-20">
        <p className="text-[18px] font-semibold mb-4">
          Ready to see where your agent spend goes?
        </p>
        <MagneticButton
          href="/signup"
          className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-7 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md"
        >
          Start free <ArrowRight className="h-4 w-4" />
        </MagneticButton>
      </Reveal>
    </div>
    </MarketingShell>
  );
}