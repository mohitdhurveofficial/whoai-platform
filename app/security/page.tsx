import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Server, ShieldCheck, KeyRound, Eye, FileCheck, ArrowRight } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How WHOAI protects your data: encryption, multi-tenant isolation, least-privilege access, and a zero-retention gateway option.",
  alternates: { canonical: "/security" },
};

const CONTROLS = [
  {
    icon: Lock,
    title: "Encryption everywhere",
    body: "All traffic is served over TLS 1.2+. Provider credentials and secrets are encrypted at rest with industry-standard algorithms before they ever touch the database.",
  },
  {
    icon: Server,
    title: "Multi-tenant isolation",
    body: "Every query is scoped to your organization. Agents, keys, spend logs, and credentials are partitioned per tenant and validated on every request.",
  },
  {
    icon: KeyRound,
    title: "Least-privilege access",
    body: "API keys are scoped to your organization and can be rotated or revoked instantly. Role-based access controls govern who can change budgets and policies.",
  },
  {
    icon: Eye,
    title: "Full auditability",
    body: "Every gateway call and policy decision is logged with cost, tokens, model, and agent — giving you a complete, tamper-evident trail of AI activity.",
  },
  {
    icon: ShieldCheck,
    title: "Zero-retention gateway",
    body: "On Enterprise and VPC plans, the gateway can forward prompts without persisting payloads — so sensitive content never lands in WHOAI storage.",
  },
  {
    icon: FileCheck,
    title: "Deploy in your own VPC",
    body: "Regulated teams can self-host WHOAI inside their own cloud boundary, keeping all data and traffic within infrastructure they control.",
  },
];

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="max-w-[960px] mx-auto px-6 py-20">
        <div className="max-w-[720px] mb-14">
          <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
            Security
          </span>
          <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-extrabold tracking-tight mb-6">
            Security is the foundation, not a feature
          </h1>
          <p className="text-[18px] text-[#666666] leading-relaxed">
            WHOAI sits on the critical path of your AI traffic, so we treat the security of your data and
            credentials as our first responsibility. Here&apos;s how we protect it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {CONTROLS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-[#EEE8E2] bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-[16px] font-bold mb-2">{title}</h3>
              <p className="text-[14px] text-[#666666] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-[#EEE8E2] bg-white p-8">
          <h2 className="text-[20px] font-bold mb-3">Responsible disclosure</h2>
          <p className="text-[15px] text-[#666666] leading-relaxed">
            If you believe you&apos;ve found a security vulnerability, please email{" "}
            <a href="mailto:security@whoai.ai" className="text-[#FF6B00] font-medium hover:underline">
              security@whoai.ai
            </a>
            . We investigate every report promptly and will keep you updated through resolution. Please
            give us a reasonable window to remediate before any public disclosure.
          </p>
        </div>

        <p className="text-[13px] text-[#999999] mt-8 leading-relaxed">
          Pursuing formal certifications such as SOC 2? Enterprise and VPC customers can request our
          current security documentation and roadmap during evaluation.
        </p>

        <div className="mt-12 flex items-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md"
          >
            Request security details <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/privacy" className="text-[15px] text-[#666666] font-medium hover:text-[#111111]">
            Read our Privacy Policy
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
