import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://whoai-platform.vercel.app"),
  title: {
    default: "WHOAI | AI FinOps Platform — See, Control & Reduce AI Spend",
    template: "%s | WHOAI",
  },
  description:
    "WHOAI is the leading AI FinOps platform for enterprises. Track LLM costs, monitor AI agents, detect anomalies, and stop runaway API bills before they impact your business. Compatible with OpenAI, Anthropic, Gemini, Grok, and DeepSeek.",
  keywords: [
    "AI FinOps platform",
    "LLM cost tracking",
    "AI cost monitoring",
    "OpenAI GPT-5.5 cost tracking",
    "Anthropic Claude Opus 4.8 cost control",
    "Google Gemini 3.5 Flash pricing",
    "xAI Grok 3 cost tracking",
    "DeepSeek V4 pricing",
    "Meta Llama 4 cost monitoring",
    "AI agent monitoring",
    "token usage tracking",
    "AI budget management",
    "LLM spend visibility",
    "AI anomaly detection",
    "runaway AI agent detection",
    "enterprise AI governance",
    "AI API cost optimization",
    "BYOK AI gateway",
    "AI cost per request",
    "smart model router",
    "prompt cache",
    "predictive budget AI",
  ],
  authors: [{ name: "WHOAI", url: "https://whoai-platform.vercel.app" }],
  creator: "WHOAI",
  publisher: "WHOAI",
  applicationName: "WHOAI Platform",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "WHOAI | AI FinOps & Cost Control Platform",
    description:
      "Track, control, and reduce AI spending across OpenAI, Anthropic, Gemini, and more. Real-time agent monitoring and budget enforcement.",
    url: "https://whoai-platform.vercel.app",
    siteName: "WHOAI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WHOAI | AI FinOps Platform",
    description:
      "Know exactly which AI agent is burning your budget. Real-time cost tracking for OpenAI, Anthropic, and all major LLM providers.",
    creator: "@whoai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Only emit Google site verification when the env var is configured.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  other: {
    "theme-color": "#FF6B00",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://whoai-platform.vercel.app/#organization",
      name: "WHOAI",
      url: "https://whoai-platform.vercel.app",
      logo: "https://whoai-platform.vercel.app/logo.svg",
      sameAs: [
        "https://twitter.com/whoai",
        "https://linkedin.com/company/whoai",
      ],
      description:
        "WHOAI is an enterprise AI FinOps platform that provides real-time cost tracking, agent monitoring, and budget enforcement for LLM APIs.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://whoai-platform.vercel.app/#product",
      name: "WHOAI Platform",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          minPrice: "0",
          maxPrice: "799",
          priceCurrency: "USD",
        },
        description:
          "Free tier available. Paid plans start at $99/mo (Starter), $299/mo (Growth), $799/mo (Pro). Enterprise pricing is custom.",
      },
      featureList: [
        "AI cost monitoring and tracking",
        "Token usage analytics",
        "Agent-level budget controls",
        "Real-time anomaly detection",
        "Multi-provider support (OpenAI GPT-5.5, Anthropic Claude Opus 4.8, Google Gemini 3.5 Flash, xAI Grok 3, DeepSeek V4, Meta Llama 4)",
        "BYOK (Bring Your Own Key) architecture",
        "Kill switch for runaway agents",
        "Smart model router with 30-60% cost savings",
        "Semantic prompt cache",
        "Predictive budget AI",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://whoai-platform.vercel.app/#website",
      url: "https://whoai-platform.vercel.app",
      name: "WHOAI",
      publisher: { "@id": "https://whoai-platform.vercel.app/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://whoai-platform.vercel.app/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-200"
        style={{ colorScheme: "light" }}
      >
        {children}
      </body>
    </html>
  );
}
