import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://whoai.ai"),
  title: {
    default: "WHOAI | See, control, and reduce AI spending",
    template: "%s | WHOAI",
  },
  description:
    "WHOAI helps enterprises see, control, and reduce AI spending before runaway agents become runaway costs.",
  keywords: [
    "AI FinOps",
    "AI cost tracking",
    "LLM cost visibility",
    "agent operations",
    "AI spend visibility",
    "OpenAI spend tracking",
    "AI budget limits",
    "AI anomaly detection",
    "AI cost leaks",
    "enterprise AI control",
  ],
  authors: [{ name: "WHOAI" }],
  creator: "WHOAI",
  publisher: "WHOAI",
  applicationName: "WHOAI Platform",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "WHOAI | AI FinOps & Cost Control",
    description:
      "See, control, and reduce AI spending before runaway agents become runaway costs.",
    url: "/",
    siteName: "WHOAI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WHOAI | AI FinOps",
    description:
      "Know exactly which AI agent is burning your budget. Take control of your AI API spend today.",
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
     <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-200" style={{ colorScheme: 'light' }}>
       {children}
     </body>
    </html>
  );
}
