import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, MagneticButton } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "How to Track GPT-4o API Costs Per Request | WHOAI Blog",
  description:
    "Learn how to track GPT-4o API costs at the per-request level. Understand prompt tokens, completion tokens, pricing tiers, and how to monitor OpenAI spending in real time.",
  keywords: [
    "GPT-4o cost tracking",
    "OpenAI API cost per request",
    "GPT-4o token pricing",
    "OpenAI spend monitoring",
    "LLM cost per request",
    "prompt tokens vs completion tokens",
    "GPT-4o budget management",
  ],
  alternates: { canonical: "/blog/gpt-4o-cost-tracking" },
  openGraph: {
    title: "How to Track GPT-4o API Costs Per Request",
    description: "Step-by-step guide to monitoring GPT-4o token usage and cost at the per-request level.",
    url: "https://whoai-platform.vercel.app/blog/gpt-4o-cost-tracking",
    type: "article",
    publishedTime: "2026-06-16T00:00:00Z",
    authors: ["WHOAI"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Track GPT-4o API Costs Per Request",
  description:
    "A step-by-step guide to monitoring GPT-4o token usage and cost at the per-request level.",
  author: { "@type": "Organization", name: "WHOAI", url: "https://whoai-platform.vercel.app" },
  publisher: { "@type": "Organization", name: "WHOAI", logo: { "@type": "ImageObject", url: "https://whoai-platform.vercel.app/logo.svg" } },
  datePublished: "2026-06-16",
  dateModified: "2026-06-16",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://whoai-platform.vercel.app/blog/gpt-4o-cost-tracking" },
};

export default function BlogPost() {
  return (
    <main className="min-h-screen bg-[#FAF7F3] text-[#111111] font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article className="max-w-[800px] mx-auto px-6 py-24">
        <nav className="mb-8">
          <Link href="/blog" className="text-[13px] font-semibold text-[#FF6B00] hover:underline">
            ← Back to Blog
          </Link>
        </nav>

        <Reveal>
          <header className="mb-10">
            <span className="inline-block bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider mb-4">
              OpenAI · Cost Tracking
            </span>
            <h1 className="text-[36px] md:text-[44px] font-bold tracking-tight leading-[1.15] mb-4">
              How to Track GPT-4o API Costs Per Request
            </h1>
            <p className="text-[16px] text-[#666666]">
              <time dateTime="2026-06-16">June 16, 2026</time> · 6 min read
            </p>
          </header>
        </Reveal>

        <div className="prose-custom">
          <p className="text-[17px] text-[#666666] leading-relaxed mb-6">
            GPT-4o is one of the most capable and cost-effective models from OpenAI — but without per-request tracking, its spending can spiral before you notice. This guide shows you exactly how to monitor every dollar your GPT-4o calls consume.
          </p>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Understanding GPT-4o Pricing</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            OpenAI charges GPT-4o by the token. A token is roughly 4 characters of English text. Your bill is the sum of:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[16px] text-[#666666] mb-6">
            <li><strong>Prompt tokens</strong> — every word, instruction, and context you send to the model</li>
            <li><strong>Completion tokens</strong> — every word the model generates back</li>
          </ul>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-6">
            As of June 2026, GPT-4o pricing is approximately <strong>$2.50 per 1,000,000 input tokens</strong> and <strong>$10.00 per 1,000,000 output tokens</strong>. That means a 2,000-token prompt with a 500-token response costs about $0.01 — but at scale, thousands of requests per day add up fast.
          </p>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Why Per-Request Tracking Matters</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            Most teams look at their OpenAI dashboard once a month. By then, a single buggy agent loop may have burned thousands of dollars. Per-request tracking lets you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[16px] text-[#666666] mb-6">
            <li>See which agent, user, or workflow drives the most GPT-4o spend</li>
            <li>Detect token spikes in real time — not 30 days later</li>
            <li>Attribute costs accurately to products, teams, or customers</li>
            <li>Enforce hard budgets before the next request is sent</li>
          </ul>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Method 1: Intercept Every API Call</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            The most reliable way to track GPT-4o costs is to route all API calls through a gateway that logs usage before forwarding to OpenAI. This is how WHOAI works:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-[16px] text-[#666666] mb-6">
            <li>Your app sends the request to WHOAI Gateway (instead of api.openai.com)</li>
            <li>The gateway parses the payload, counts tokens, and estimates cost</li>
            <li>The request is forwarded to OpenAI with your own API key (BYOK)</li>
            <li>When OpenAI responds, the gateway logs actual prompt + completion tokens and exact cost</li>
            <li>You get a per-request breakdown in your dashboard</li>
          </ol>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Method 2: Parse the Usage Object</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            OpenAI returns a <code>usage</code> object in every API response:
          </p>
          <pre className="bg-[#111111] text-[#D4D4D4] p-4 rounded-lg overflow-x-auto text-[13px] font-mono mb-6">
{`{
  "usage": {
    "prompt_tokens": 1240,
    "completion_tokens": 480,
    "total_tokens": 1720
  }
}`}
          </pre>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-6">
            Multiply <code>prompt_tokens</code> by the input price and <code>completion_tokens</code> by the output price. Use <code>Decimal</code> math (not float) to avoid rounding errors that compound at scale.
          </p>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Method 3: Streaming Cost Estimation</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            For streaming responses, OpenAI may include a final chunk with the <code>usage</code> object. If it does not, you must estimate from the delta content. A conservative fallback is <code>len(delta) // 4</code> tokens per chunk — but real usage parsing is always more accurate.
          </p>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Common GPT-4o Cost Leaks</h2>
          <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-lg p-5 mb-6">
            <ul className="list-disc pl-6 space-y-3 text-[16px] text-[#666666]">
              <li><strong>Long context windows</strong> — GPT-4o supports 128K tokens. A full context window costs $0.32 per request just for input.</li>
              <li><strong>Recursive agent loops</strong> — An agent that calls itself without a token cap can burn $50+ in minutes.</li>
              <li><strong>Unused system prompts</strong> — Every system message counts as prompt tokens. A 500-token system prompt on 1,000 requests = 500K extra tokens.</li>
              <li><strong>High-temperature retries</strong> — Setting temperature above 0.7 increases completion length significantly.</li>
            </ul>
          </div>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Setting a Per-Agent GPT-4o Budget</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            With WHOAI, you can set a daily or monthly spend limit per agent. When a GPT-4o request would push the agent over budget, the gateway blocks it instantly and triggers a kill switch. This prevents the &ldquo;wake up to a $10,000 bill&rdquo; scenario entirely.
          </p>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Summary</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-6">
            Tracking GPT-4o costs per request is not optional at scale. Use a gateway to intercept calls, parse the <code>usage</code> object for accuracy, and enforce atomic budget pre-reservation so concurrent requests cannot bypass your limits. The result: complete visibility into every dollar your AI agents spend.
          </p>

          <Reveal className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg p-5 mt-8">
            <p className="text-[15px] font-semibold text-[#111111] mb-1">Ready to track GPT-4o costs in real time?</p>
            <p className="text-[14px] text-[#666666] mb-3">
              WHOAI gives you per-request cost tracking, token analytics, and budget enforcement for OpenAI, Anthropic, Gemini, and more.
            </p>
            <MagneticButton href="/signup" className="inline-block bg-[#FF6B00] text-white px-5 py-2.5 rounded-md font-semibold text-[14px] hover:bg-[#E65A00] transition-colors">
              Start Free Trial
            </MagneticButton>
          </Reveal>
        </div>

        <Reveal>
          <hr className="border-[#EEE8E2] my-10" />
          <div className="flex gap-4">
            <Link href="/blog/preventing-claude-costs" className="text-[14px] font-semibold text-[#FF6B00] hover:underline">
              Next: Preventing Runaway Claude 3.5 Sonnet Costs →
            </Link>
          </div>
        </Reveal>
      </article>
    </main>
  );
}
