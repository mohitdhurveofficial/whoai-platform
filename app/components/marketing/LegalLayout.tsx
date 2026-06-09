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
        <p className="text-[14px] text-[#888888] mb-4">Effective date: {effectiveDate}</p>
        <div className="rounded-lg border border-[#EEE8E2] bg-[#FFF9F3] px-4 py-3 text-[13px] text-[#7A6A57] mb-12">
          This document is a template provided for convenience and does not constitute legal advice.
          Have it reviewed by qualified counsel before relying on it.
        </div>
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
