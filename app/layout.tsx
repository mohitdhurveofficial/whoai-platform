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
    "OpenAI cost tracking",
    "Anthropic cost control",
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
  verification: {
    // INSTRUCTION: Get your verification code from https://search.google.com/search-console
    // Go to Add Property → Domain → Copy the meta tag content value → paste below.
    google: "google-site-verification-code",
  },
  other: {
    "theme-color": "#FF6B00",
    "msapplication-TileColor": "#FF6B00",
    "msapplication-config": "/browserconfig.xml",
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
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "127",
      },
      featureList: [
        "AI cost monitoring and tracking",
        "Token usage analytics",
        "Agent-level budget controls",
        "Real-time anomaly detection",
        "Multi-provider support (OpenAI, Anthropic, Gemini, Grok, DeepSeek)",
        "BYOK (Bring Your Own Key) architecture",
        "Kill switch for runaway agents",
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
