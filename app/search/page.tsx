import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search WHOAI",
  description: "Search the WHOAI platform for AI FinOps guides, LLM cost tracking tutorials, and budget management documentation.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/search" },
};

const SITE_PAGES = [
  { title: "AI FinOps Platform", url: "/", desc: "Track, control, and reduce AI spending across OpenAI, Anthropic, Gemini, and more." },
  { title: "Pricing", url: "/pricing", desc: "Transparent pricing for AI cost monitoring and budget enforcement." },
  { title: "Demo", url: "/demo", desc: "Book a live demo of the WHOAI platform." },
  { title: "Docs", url: "/docs", desc: "Documentation for integrating WHOAI with your AI stack." },
  { title: "Quickstart", url: "/docs/quickstart", desc: "Get started tracking AI costs in under 5 minutes." },
  { title: "Trust Center", url: "/trust", desc: "Security, compliance, and data handling at WHOAI." },
  { title: "Security", url: "/security", desc: "Enterprise-grade security for your AI cost data." },
  { title: "Status", url: "/status", desc: "Real-time system status and uptime for the WHOAI gateway." },
  { title: "Contact", url: "/contact", desc: "Get in touch with the WHOAI team." },
  { title: "Blog", url: "/blog", desc: "Guides on AI FinOps, LLM cost tracking, and budget management." },
  { title: "How to Track GPT-4o API Costs Per Request", url: "/blog/gpt-4o-cost-tracking", desc: "Step-by-step guide to tracking GPT-4o costs at the per-request level." },
  { title: "Preventing Runaway Claude 3.5 Sonnet Costs", url: "/blog/preventing-claude-costs", desc: "How to set budgets and kill switches for Claude API spending." },
  { title: "AI FinOps: A Complete Guide", url: "/blog/ai-finops-guide", desc: "The definitive guide to AI financial operations and LLM cost management." },
];

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F3] text-[#111111] font-sans">
      <div className="max-w-[800px] mx-auto px-6 py-24">
        <h1 className="text-[40px] font-bold tracking-tight mb-4">Search WHOAI</h1>
        <p className="text-[16px] text-[#666666] mb-10">
          Find guides on AI cost tracking, LLM budget management, and platform documentation.
        </p>

        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-lg p-6 mb-10">
          <p className="text-[14px] text-[#888888] mb-4">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {["GPT-4o cost tracking", "Claude budget limits", "AI FinOps guide", "BYOK setup", "Token usage monitoring", "Runaway agent detection"].map((term) => (
              <span key={term} className="bg-[#FAF7F3] border border-[#EEE8E2] px-3 py-1.5 rounded text-[13px] text-[#666666]">
                {term}
              </span>
            ))}
          </div>
        </div>

        <h2 className="text-[20px] font-bold mb-4">All Pages</h2>
        <ul className="space-y-3">
          {SITE_PAGES.map((page) => (
            <li key={page.url}>
              <Link href={page.url} className="block bg-[#FFFFFF] border border-[#EEE8E2] rounded-lg p-4 hover:border-[#FF6B00] transition-colors">
                <span className="font-semibold text-[15px] text-[#111111]">{page.title}</span>
                <p className="text-[13px] text-[#888888] mt-1">{page.desc}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
