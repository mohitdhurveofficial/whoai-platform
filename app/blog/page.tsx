import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Blog — AI FinOps, LLM Cost Tracking & Budget Management",
  description:
    "The WHOAI blog covers AI FinOps best practices, LLM cost tracking, token usage monitoring, and how to prevent runaway AI agent spending across OpenAI, Anthropic, Gemini, and more.",
  keywords: [
    "AI FinOps blog",
    "LLM cost tracking guide",
    "AI budget management",
    "OpenAI cost optimization",
    "Claude cost control",
    "token usage monitoring",
    "AI agent spending",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "WHOAI Blog — AI FinOps & LLM Cost Tracking",
    description: "Guides and best practices for tracking and controlling AI API spending.",
    url: "https://whoai-platform.vercel.app/blog",
    type: "website",
  },
};

const posts = [
  {
    slug: "model-continuity-after-the-export-control-shutdown",
    title: "When a Model Goes Dark Overnight: Model-Continuity Risk Is Real Now",
    excerpt:
      "A frontier model was disabled worldwide overnight by an export-control order — and stranded everyone built on it. Here's how to make sure no single model, or single bill, can take your agents down.",
    date: "2026-06-18",
    readTime: "5 min read",
    tags: ["Model Continuity", "Resilience", "Multi-Provider"],
  },
  {
    slug: "gpt-4o-cost-tracking",
    title: "How to Track GPT-4o API Costs Per Request",
    excerpt:
      "A step-by-step guide to monitoring GPT-4o token usage and cost at the per-request level. Learn how prompt tokens, completion tokens, and pricing tiers affect your bill.",
    date: "2026-06-16",
    readTime: "6 min read",
    tags: ["OpenAI", "GPT-4o", "Cost Tracking"],
  },
  {
    slug: "preventing-claude-costs",
    title: "Preventing Runaway Claude 3.5 Sonnet Costs",
    excerpt:
      "How autonomous agents can silently burn through Claude API budgets — and how to set hard limits, kill switches, and anomaly detection to stop it before it happens.",
    date: "2026-06-16",
    readTime: "7 min read",
    tags: ["Anthropic", "Claude", "Budget Controls"],
  },
  {
    slug: "ai-finops-guide",
    title: "AI FinOps: A Complete Guide to LLM Budget Management",
    excerpt:
      "The definitive guide to AI financial operations. Covers cost visibility, token analytics, multi-provider pricing, budget enforcement, and team governance for enterprise AI.",
    date: "2026-06-16",
    readTime: "10 min read",
    tags: ["AI FinOps", "Strategy", "Enterprise"],
  },
];

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F3] text-[#111111] font-sans">
      <div className="max-w-[900px] mx-auto px-6 py-24">
        <Reveal>
          <h1 className="text-[40px] font-bold tracking-tight mb-4">WHOAI Blog</h1>
          <p className="text-[18px] text-[#666666] mb-12 max-w-[600px]">
            Practical guides on AI FinOps, LLM cost tracking, and stopping runaway AI spending before it impacts your business.
          </p>
        </Reveal>

        <Stagger className="space-y-6">
          {posts.map((post) => (
            <StaggerItem hover key={post.slug}>
              <article className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-lg p-6 hover:border-[#FF6B00] transition-colors transition-shadow hover:shadow-md">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bg-[#FAF7F3] border border-[#EEE8E2] px-2 py-0.5 rounded text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-[22px] font-bold text-[#111111] mb-2">{post.title}</h2>
                  <p className="text-[15px] text-[#666666] leading-relaxed mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-[13px] text-[#888888]">
                    <time dateTime={post.date}>{post.date}</time>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </Link>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </main>
  );
}
