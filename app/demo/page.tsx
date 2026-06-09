import type { Metadata } from "next";
import { Activity, BarChart3, ShieldAlert, CheckCircle2 } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";
import LeadForm from "@/app/components/marketing/LeadForm";

export const metadata: Metadata = {
  title: "Book a Demo",
  description:
    "See WHOAI in action. Get a personalized walkthrough of AI cost tracking, budget controls, and the runaway-agent kill switch.",
  alternates: { canonical: "/demo" },
};

const POINTS = [
  {
    icon: BarChart3,
    title: "See your real spend",
    body: "We'll connect a test workload and show spend by agent, model, and team in real time.",
  },
  {
    icon: ShieldAlert,
    title: "Stop a runaway agent live",
    body: "Watch budget thresholds and the kill switch halt an over-spending agent in seconds.",
  },
  {
    icon: Activity,
    title: "Tailored to your stack",
    body: "OpenAI, Anthropic, Gemini, Azure, Bedrock — we'll map WHOAI to the providers you use.",
  },
];

export default function DemoPage() {
  return (
    <MarketingShell>
      <section className="max-w-[1100px] mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
            Book a demo
          </span>
          <h1 className="text-[40px] md:text-[48px] leading-[1.1] font-extrabold tracking-tight mb-6">
            See exactly where your AI budget goes
          </h1>
          <p className="text-[18px] text-[#666666] mb-10 leading-relaxed">
            A 30-minute walkthrough with our team. No slides — we&apos;ll show WHOAI running against a
            real agent workload and answer your questions.
          </p>
          <div className="space-y-6">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold mb-1">{title}</h3>
                  <p className="text-[14px] text-[#666666] leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-2 text-[14px] text-[#666666]">
            <CheckCircle2 className="h-4 w-4 text-[#047857]" />
            Response within one business day.
          </div>
        </div>
        <div className="lg:pt-12">
          <LeadForm kind="DEMO" />
        </div>
      </section>
    </MarketingShell>
  );
}
