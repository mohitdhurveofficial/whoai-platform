import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, KeyRound, Terminal } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";
import { Reveal, Stagger, StaggerItem, MagneticButton } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Start sending AI traffic through the WHOAI gateway in minutes. Quickstart, authentication, and API reference.",
  alternates: { canonical: "/docs" },
};

const curlExample = `curl https://whoai-platform.vercel.app/api/v1/chat/completions \\
  -H "Authorization: Bearer $WHOAI_API_KEY" \\
  -H "x-agent-id: $AGENT_ID" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Summarize Q3 revenue." }
    ]
  }'`;

const STEPS = [
  {
    icon: KeyRound,
    title: "1. Create an API key & agent",
    body: "In the dashboard, create an organization API key and register an agent. Each request is attributed to an agent so you can track spend per workload.",
  },
  {
    icon: Terminal,
    title: "2. Point your traffic at the gateway",
    body: "Swap your provider's base URL for the WHOAI gateway and pass your key as a Bearer token plus the x-agent-id header. WHOAI forwards the call, logs spend, and enforces budgets.",
  },
  {
    icon: BookOpen,
    title: "3. Watch spend in real time",
    body: "Every call appears in your dashboard with cost, tokens, model, and agent — and budgets or the kill switch step in automatically when limits are hit.",
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-xl border border-[#26211C] bg-[#1A1714] text-[#E8E2DA] text-[13px] leading-relaxed p-5 overflow-x-auto font-mono">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <MarketingShell>
      <section className="max-w-[860px] mx-auto px-6 py-20">
        <Reveal>
          <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
            Documentation
          </span>
          <h1 className="text-[40px] md:text-[48px] leading-[1.1] font-extrabold tracking-tight mb-6">
            Quickstart
          </h1>
          <p className="text-[18px] text-[#666666] mb-12 leading-relaxed">
            WHOAI sits in front of your LLM providers as a drop-in gateway. Route your calls through it and
            get cost tracking, budgets, and the kill switch with no SDK rewrite.
          </p>
        </Reveal>

        <Stagger className="space-y-6 mb-14" stagger={0.1}>
          {STEPS.map(({ icon: Icon, title, body }) => (
            <StaggerItem
              key={title}
              hover
              className="flex gap-4 rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold mb-1">{title}</h3>
                <p className="text-[14px] text-[#666666] leading-relaxed">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal>
          <h2 className="text-[22px] font-extrabold tracking-tight mb-4">Example request</h2>
          <p className="text-[15px] text-[#666666] mb-4 leading-relaxed">
            Send an OpenAI-style chat completion through the gateway. The <code className="text-[#FF6B00]">provider</code>{" "}
            field selects the upstream LLM; supported values include <code className="text-[#FF6B00]">openai</code>,{" "}
            <code className="text-[#FF6B00]">anthropic</code>, and <code className="text-[#FF6B00]">gemini</code>.
          </p>
          <CodeBlock>{curlExample}</CodeBlock>
        </Reveal>

        <Reveal className="mt-12 rounded-2xl border border-[#EEE8E2] bg-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-[20px] font-bold mb-1">Full API reference</h2>
            <p className="text-[15px] text-[#666666]">
              Explore every endpoint, schema, and error code in the live interactive docs.
            </p>
          </div>
          <MagneticButton
            href="/docs"
            className="shrink-0 inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#000000] transition-colors"
          >
            Open API reference <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </Reveal>

        <p className="text-[15px] text-[#666666] mt-10">
          Need a hand integrating?{" "}
          <Link href="/demo" className="text-[#FF6B00] font-medium inline-flex items-center gap-1 hover:underline">
            Book a demo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </section>
    </MarketingShell>
  );
}
