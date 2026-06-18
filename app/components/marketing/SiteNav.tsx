import Link from "next/link";

/**
 * Shared marketing navigation used across all public (logged-out) pages.
 * Single source of truth so every page shares identical chrome and real links.
 */
export default function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 bg-[#FAF7F3]/90 backdrop-blur-md border-b border-[#EEE8E2]">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FF6B00] text-sm font-bold text-white shadow-sm">
              W
            </div>
            <span className="text-[17px] font-bold tracking-tight">WHOAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#666666]">
            <Link href="/#features" className="hover:text-[#111111] transition-colors">Product</Link>
            <Link href="/pricing" className="hover:text-[#111111] transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-[#111111] transition-colors">Docs</Link>
            <Link href="/teardown" className="hover:text-[#111111] transition-colors">Free Teardown</Link>
            <Link href="/security" className="hover:text-[#111111] transition-colors">Security</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-[14px] font-medium text-[#111111] hover:text-[#FF6B00] transition-colors hidden md:block">
            Sign In
          </Link>
          <Link href="/demo" className="bg-[#FFFFFF] border border-[#EEE8E2] text-[#111111] px-4 py-2.5 rounded-md font-medium text-[14px] shadow-sm hover:border-[#DCD5CD] transition-colors">
            Book Demo
          </Link>
          <Link href="/auth/signup" className="bg-[#FF6B00] text-white px-4 py-2.5 rounded-md font-medium text-[14px] hover:bg-[#E65A00] transition-colors shadow-sm">
            Start Free Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
