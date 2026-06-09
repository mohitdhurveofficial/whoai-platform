import React from "react";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";

/**
 * Wrapper for public marketing pages: shared background, nav, and footer.
 * Matches the landing page palette (cream bg, ink text, orange accent).
 */
export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#111111] font-sans selection:bg-[#FF6B00] selection:text-white flex flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
