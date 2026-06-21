import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";
import { Reveal, Stagger, StaggerItem, MagneticButton } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Quickstart Guide",
  description: "Get started with WHOAI in 5 minutes: sign up, connect your AI keys, and start monitoring spend.",
  alternates: { canonical: "/docs/quickstart" },
};

export default function QuickstartPage() {
  return (
    <MarketingShell>
    <div className="max-w-[1200px] mx-auto px-6 py-20">
      <Reveal className="text-center max-w-[720px] mx-auto mb-16">
        <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
          Documentation
        </span>
        <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-extrabold tracking-tight mb-6">
          Get started in 5 minutes
        </h1>
        <p className="text-[18px] text-[#666666] leading-relaxed">
          Follow these steps to connect your AI agents to WHOAI and gain instant visibility into your AI spend.
        </p>
      </Reveal>

      <Stagger className="space-y-12 pb-8" stagger={0.1}>
        <StaggerItem className="flex items-start gap-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] shrink-0">
            <span className="text-[24px] font-bold">1</span>
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Sign up for WHOAI</h2>
            <p className="text-[15px] text-[#666666]">
              Create your account at <Link href="/auth/signup" className="text-[#FF6B00] font-medium hover:underline">whoai.ai/auth/signup</Link>.
              No credit card required for the Free plan.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem className="flex items-start gap-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] shrink-0">
            <span className="text-[24px] font-bold">2</span>
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Create your organization</h2>
            <p className="text-[15px] text-[#666666]">
              After signing up, you&apos;ll be prompted to create an organization. This is where your team&apos;s AI spend
              will be tracked and managed.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem className="flex items-start gap-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] shrink-0">
            <span className="text-[24px] font-bold">3</span>
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Connect your AI provider keys</h2>
            <p className="text-[15px] text-[#666666]">
              Go to Settings → API Keys and add your OpenAI and/or Anthropic keys. Your keys are encrypted
              at rest and never exposed in logs or APIs.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem className="flex items-start gap-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] shrink-0">
            <span className="text-[24px] font-bold">4</span>
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Point your agents to WHOAI</h2>
            <p className="text-[15px] text-[#666666]">
              Update your AI agent configuration to route requests through the WHOAI FastAPI gateway:
              <br />
              <code className="bg-[#FAF7F3] px-1 py-0.5 rounded text-[13px]">https://whoai-api.onrender.com/api/v1/chat/completions</code>
              <br />
              Pass your agent JWT as the Bearer token. The provider and model go in the request body; WHOAI injects your BYOK provider keys securely.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem className="flex items-start gap-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] shrink-0">
            <span className="text-[24px] font-bold">5</span>
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Set your first budget</h2>
            <p className="text-[15px] text-[#666666]">
              In Settings → Budgets, set a monthly spend limit for your organization. WHOAI will automatically
              block requests that exceed the budget and alert you in real time.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem className="flex items-start gap-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00] shrink-0">
            <span className="text-[24px] font-bold">6</span>
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Watch your spend in real time</h2>
            <p className="text-[15px] text-[#666666]">
              Visit the dashboard to see live token usage, agent activity, and cost trends. Spot anomalies
              before they impact your bill.
            </p>
          </div>
        </StaggerItem>
      </Stagger>

      <Reveal className="mt-16 p-6 bg-[#FAF7F3] rounded-xl border border-[#EEE8E2]">
        <h2 className="text-[20px] font-bold text-[#111111] mb-4">Need help?</h2>
        <p className="text-[15px] text-[#666666] mb-4">
          Check out our <Link href="/docs" className="text-[#FF6B00] font-medium hover:underline">full documentation</Link>
          or schedule a <Link href="/demo" className="text-[#FF6B00] font-medium hover:underline">live demo</Link>.
        </p>
        <MagneticButton
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-md font-semibold text-[15px] border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FFF1E8] transition-colors"
        >
          Contact support <ArrowRight className="h-4 w-4" />
        </MagneticButton>
      </Reveal>
    </div>
    </MarketingShell>
  );
}