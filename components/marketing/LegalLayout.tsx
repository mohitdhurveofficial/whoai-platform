import React from "react";
import MarketingShell from "./MarketingShell";

/**
 * Shared layout for long-form legal pages (Privacy, Terms).
 * Applies readable typography to plain markup without a prose plugin.
 */
export default function LegalLayout({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <MarketingShell>
      <article className="max-w-[760px] mx-auto px-6 py-20">
        <h1 className="text-[36px] md:text-[44px] font-extrabold tracking-tight mb-3">{title}</h1>
        <p className="text-[14px] text-[#888888] mb-12">Effective date: {effectiveDate}</p>
        {/* Dev reminder: these legal documents should be reviewed by qualified counsel before launch. */}
        <div
          className="space-y-6 text-[16px] leading-relaxed text-[#444444]
            [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:text-[#111111] [&_h2]:mt-10 [&_h2]:mb-3
            [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:text-[#111111] [&_h3]:mt-6 [&_h3]:mb-2
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
            [&_a]:text-[#FF6B00] [&_a]:underline"
        >
          {children}
        </div>
      </article>
    </MarketingShell>
  );
}
