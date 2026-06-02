import type { Metadata } from "next";
import "./globals.css";
import { CommandPalette } from "@/app/components/CommandPalette";

export const metadata: Metadata = {
  metadataBase: new URL("https://whoai.ai"),
  title: {
    default: "WhoAI | Runtime Governance for Autonomous AI Agents",
    template: "%s | WhoAI",
  },
  description:
    "WhoAI helps teams govern autonomous AI agents with runtime policies, risk detection, human approvals, audit trails, and enterprise-grade analytics.",
  keywords: [
    "AI governance",
    "autonomous AI agents",
    "runtime governance",
    "AI approval workflows",
    "AI audit trail",
    "AI risk management",
    "agent security",
    "enterprise AI governance",
  ],
  authors: [{ name: "WhoAI" }],
  creator: "WhoAI",
  publisher: "WhoAI",
  applicationName: "WhoAI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "WhoAI | Runtime Governance for Autonomous AI Agents",
    description:
      "Prevent unauthorized AI actions, enforce runtime policies, require human approval, and maintain a complete audit trail.",
    url: "/",
    siteName: "WhoAI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhoAI | Runtime Governance for Autonomous AI Agents",
    description:
      "Runtime policies, approval workflows, risk detection, and audit trails for enterprise AI agents.",
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
       <CommandPalette />
     </body>
    </html>
  );
}
