"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Shared marketing navigation used across all public (logged-out) pages.
 * Single source of truth so every page shares identical chrome and real links.
 *
 * The link row and "Sign In" are desktop-only by design, but previously had no
 * mobile fallback at all — on a phone, Product/Pricing/Docs/Teardown/Security
 * were unreachable and an existing customer could not sign in from the site.
 * Hence the disclosure menu below.
 */

const LINKS = [
  { href: "/#features", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/continuity", label: "Continuity" },
  { href: "/docs", label: "Docs" },
  { href: "/teardown", label: "Free Teardown" },
  { href: "/security", label: "Security" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#EEE8E2] bg-[#FAF7F3]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FF6B00] text-sm font-bold text-white shadow-sm">
              W
            </div>
            <span className="text-[17px] font-bold tracking-tight">WHOAI</span>
          </Link>
          <div className="hidden items-center gap-8 text-[14px] font-medium text-[#666666] md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/auth/login"
            className="hidden rounded text-[14px] font-medium text-[#111111] transition-colors hover:text-[#FF6B00] md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
          <Link
            href="/demo"
            className="hidden rounded-md border border-[#EEE8E2] bg-[#FFFFFF] px-4 py-2.5 text-[14px] font-medium text-[#111111] shadow-sm transition-colors hover:border-[#DCD5CD] sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            Book Demo
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-[#FF6B00] px-4 py-2.5 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#E65A00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            Start Free Trial
          </Link>

          <button
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-nav-mobile"
            className="rounded-md border border-[#EEE8E2] bg-white p-2 text-[#111111] shadow-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="site-nav-mobile" className="border-t border-[#EEE8E2] bg-[#FAF7F3] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-[15px] font-medium text-[#111111] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[#EEE8E2] pt-3">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-[15px] font-semibold text-[#111111] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                Sign In
              </Link>
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-[15px] font-medium text-[#666666] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                Book Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
