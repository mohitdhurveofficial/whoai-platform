import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  Network,
  Users,
  Zap,
  CircleAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trust Center",
  description:
    "WHOAI's commitment to security, privacy, and transparency. Learn how we protect your data and AI spend.",
  alternates: { canonical: "/trust" },
};

export default function TrustPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-20">
      <div className="text-center max-w-[720px] mx-auto mb-16">
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
      </div>

      <section className="mb-16">
        <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-12">
          How WHOAI Protects Your AI Spend
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Data Flow */}
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#FF6B00]" /> Secure Data Flow
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              All AI requests flow through our encrypted gateway. We log, enforce budgets,
              and forward to your providers — never storing or seeing your prompts or responses.
            </p>
            <div className="text-[13px] text-[#888888]">
              <span className="font-medium">Your App</span> &rarr;
              <span className="font-medium">WHOAI Gateway (Encrypted)</span> &rarr;
              <span className="font-medium">Your AI Provider (OpenAI, Anthropic, etc.)</span>
            </div>
          </div>

          {/* Encryption */}
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#FF6B00]" /> Encryption Everywhere
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              Data at rest is encrypted with AES-256. Data in transit uses TLS 1.2+.
              Your provider keys are encrypted at rest and never exposed in logs or APIs.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-12">
          Key Management & Control
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Key Management */}
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-[#FF6B00]" /> Bring Your Own Keys (BYOK)
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              You connect your own OpenAI, Anthropic, and other provider keys.
              WHOAI only serves as a secure gateway — we never resell or markup tokens.
            </p>
          </div>

          {/* Log Storage */}
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#FF6B00]" /> Tamper-Evident Logging
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              All gateway decisions are append-only logged with hash chaining.
              Export audit logs as JSON or CSV for compliance and forensics.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-12">
          Access & Governance
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Access Controls */}
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#FF6B00]" /> Role-Based Access Control
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              Assign Admin or User roles to team members. Admins manage keys,
              budgets, and alerts. Users view spend and agent activity.
            </p>
          </div>

          {/* API Security */}
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FF6B00]" /> Secure API Access
            </h3>
            <p className="text-[15px] text-[#666666] mb-4">
              Every request to the WHOAI API is authenticated and authorized.
              API keys are scoped to organizations and can be rotated instantly.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16 bg-[#FAF7F3] rounded-xl border border-[#EEE8E2] p-8">
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
            Download DPA
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-[28px] font-extrabold tracking-tight text-center mb-12">
          Subprocessors & Transparency
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#EEE8E2] bg-white p-4">
            <p className="text-[14px] font-medium text-[#111111]">Vercel</p>
            <p className="text-[13px] text-[#666666]">Hosting & CDN</p>
          </div>
          <div className="rounded-lg border border-[#EEE8E2] bg-white p-4">
            <p className="text-[14px] font-medium text-[#111111]">Supabase</p>
            <p className="text-[13px] text-[#666666]">Database & Auth</p>
          </div>
          <div className="rounded-lg border border-[#EEE8E2] bg-white p-4">
            <p className="text-[14px] font-medium text-[#111111]">Stripe</p>
            <p className="text-[13px] text-[#666666]">Payments & Billing</p>
          </div>
        </div>
        <p className="text-[13px] text-[#666666] mt-4 text-center">
          We subprocess only essential infrastructure providers. No data is shared
          with subprocessors for AI processing — your keys and prompts remain
          strictly within your control.
        </p>
      </section>

      <div className="text-center mt-20">
        <p className="text-[18px] font-semibold mb-4">
          Ready to see where your agent spend goes?
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-7 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md"
        >
          Start free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}