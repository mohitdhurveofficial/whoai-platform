import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, MagneticButton } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "When a Model Goes Dark Overnight: Model-Continuity Risk Is Real Now | WHOAI Blog",
  description:
    "A frontier model was disabled worldwide overnight by an export-control order. Here's how to make sure no single model — or single bill — can take your agents down.",
  keywords: [
    "model continuity risk",
    "provider concentration",
    "multi-provider failover",
    "AI resilience",
    "LLM provider risk",
    "AI continuity planning",
  ],
  alternates: { canonical: "/blog/model-continuity-after-the-export-control-shutdown" },
  openGraph: {
    title: "When a Model Goes Dark Overnight: Model-Continuity Risk Is Real Now",
    description:
      "A frontier model was disabled worldwide overnight. How to make sure no single model — or single bill — can take your agents down.",
    url: "https://whoai-platform.vercel.app/blog/model-continuity-after-the-export-control-shutdown",
    type: "article",
    publishedTime: "2026-06-18T00:00:00Z",
    authors: ["WHOAI"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "When a Model Goes Dark Overnight: Model-Continuity Risk Is Real Now",
  description:
    "A frontier model was disabled worldwide overnight by an export-control order. How to make sure no single model — or single bill — can take your agents down.",
  author: { "@type": "Organization", name: "WHOAI", url: "https://whoai-platform.vercel.app" },
  publisher: {
    "@type": "Organization",
    name: "WHOAI",
    logo: { "@type": "ImageObject", url: "https://whoai-platform.vercel.app/logo.svg" },
  },
  datePublished: "2026-06-18",
  dateModified: "2026-06-18",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://whoai-platform.vercel.app/blog/model-continuity-after-the-export-control-shutdown",
  },
};

export default function BlogPost() {
  return (
    <main className="min-h-screen bg-[#FAF7F3] text-[#111111] font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article className="max-w-[800px] mx-auto px-6 py-24">
        <nav className="mb-8">
          <Link href="/blog" className="text-[13px] font-semibold text-[#FF6B00] hover:underline">← Back to Blog</Link>
        </nav>

        <Reveal>
          <header className="mb-10">
            <span className="inline-block bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider mb-4">
              Model Continuity · Resilience
            </span>
            <h1 className="text-[36px] md:text-[44px] font-bold tracking-tight leading-[1.15] mb-4">
              When a model goes dark overnight: model-continuity risk is real now
            </h1>
            <p className="text-[16px] text-[#666666]"><time dateTime="2026-06-18">June 18, 2026</time> · 5 min read</p>
          </header>
        </Reveal>

        <div className="prose-custom">
          <p className="text-[17px] text-[#666666] leading-relaxed mb-6">
            On June 12, 2026, a US export-control directive forced a frontier model offline worldwide
            overnight. Every team that had built on it woke up to the same thing: agents failing, no
            migration window, no fallback, no notice. By the time workarounds were being discussed, the
            production traffic had already stopped.
          </p>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-6">
            We&apos;re not going to use that event to score points against a vendor — the provider did
            what it was legally required to do. The takeaway isn&apos;t about one company or one model.
            It&apos;s about a risk most teams quietly carry without pricing it: <strong>provider
            concentration</strong>.
          </p>

          <h2 className="text-[24px] font-bold mt-10 mb-4">The risk you didn&apos;t put on the books</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            When your product runs on a single provider, events you don&apos;t control become your
            outage. An API outage. A sudden price change. A rate-limit tightening. A regulatory order.
            Any one of them, on a model you can&apos;t swap out in time, is an existential event for
            whatever you shipped on top of it.
          </p>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-6">
            It&apos;s the same shape as the cost problem we&apos;ve always talked about. A runaway agent
            can burn your budget in an afternoon. A single directive can take a model offline overnight.
            Different timelines, same root cause — you don&apos;t fully control the AI your business now
            runs on. Same exposure, one answer.
          </p>

          <h2 className="text-[24px] font-bold mt-10 mb-4">What WHOAI does about it</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            WHOAI is one control plane for both faces of that exposure: cost and continuity.
          </p>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-4">
            <strong>Cost, enforced in the path.</strong> Most tools show you the bill after the damage
            is done. WHOAI enforces a hard budget before each call — atomic pre-reservation, not an
            after-the-fact alert — and pairs it with an instant kill switch for runaway agents. It&apos;s
            a block, not a notification.
          </p>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-6">
            <strong>Continuity, configured before you need it.</strong> The gateway ships adapters for
            OpenAI, Anthropic, Gemini, xAI, and DeepSeek. You connect your own keys for each provider you
            want available. Name a fallback provider, and a failed call can route to a model you&apos;ve
            already connected. This is opt-in and configured by you, not automatic outage-detection —
            we&apos;d rather be honest about that than promise a black box. The failover is real, it&apos;s
            tested when you set it up, and it keeps running with your budget caps and kill switch still
            enforcing the whole time.
          </p>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-6">
            Because it&apos;s BYOK, your keys stay spread across providers instead of locked to one, and
            we never mark up or resell tokens — we charge a subscription, so our incentives stay aligned
            with yours.
          </p>

          <h2 className="text-[24px] font-bold mt-10 mb-4">Treat continuity like a line item</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed mb-6">
            The teams that came through last week best weren&apos;t lucky — they had a second path wired
            up before they needed it. That&apos;s the whole move. Map which agents depend on a single
            model. Connect a second provider. Name a fallback. Test it. Provider-concentration risk now
            has a known price; the only mistake is leaving it off the books.
          </p>

          <Reveal className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg p-5 mt-8">
            <p className="text-[15px] font-semibold text-[#111111] mb-1">Make any single model survivable.</p>
            <p className="text-[14px] text-[#666666] mb-3">
              Start free, connect your providers, and name a fallback before the next surprise lands — without giving up your budget caps or kill switch.
            </p>
            <MagneticButton href="/continuity" className="inline-block bg-[#FF6B00] text-white px-5 py-2.5 rounded-md font-semibold text-[14px] hover:bg-[#E65A00] transition-colors">
              See how continuity works
            </MagneticButton>
          </Reveal>

          <p className="text-[13px] text-[#888888] italic leading-relaxed mt-8">
            WHOAI is a resilience-and-cost layer. We do not help circumvent export controls or resell
            restricted models — we make it straightforward to run on the providers you&apos;re permitted
            to use, and to move between them.
          </p>
        </div>

        <Reveal>
          <hr className="border-[#EEE8E2] my-10" />
          <Link href="/blog/ai-finops-guide" className="text-[14px] font-semibold text-[#FF6B00] hover:underline">← Read: AI FinOps — A Complete Guide to LLM Budget Management</Link>
        </Reveal>
      </article>
    </main>
  );
}
