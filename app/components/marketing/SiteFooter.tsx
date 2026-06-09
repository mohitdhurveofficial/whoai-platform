import Link from "next/link";

const LIVE_API_DOCS = "https://whoai-api.onrender.com/docs";
const STATUS_URL = "https://whoai-api.onrender.com/health";

/**
 * Shared marketing footer used across all public (logged-out) pages.
 * Every link resolves to a real destination — no dead `#` anchors.
 */
export default function SiteFooter() {
  return (
    <footer className="relative z-10 bg-[#FAF7F3] border-t border-[#EEE8E2] py-16">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
        <div className="col-span-2 lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FF6B00] text-[10px] font-bold text-white shadow-sm">
              W
            </div>
            <span className="text-[15px] font-bold tracking-tight">WHOAI</span>
          </Link>
          <p className="text-[14px] text-[#888888] max-w-[250px]">
            The FinOps control plane for the autonomous AI era. Track tokens, enforce budgets, and stop runaway spend.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-[#111111] mb-4 uppercase tracking-wider">Product</h4>
          <ul className="space-y-3">
            <li><Link href="/#features" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">AI Gateway</Link></li>
            <li><Link href="/#features" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Cost Analytics</Link></li>
            <li><Link href="/#features" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Budget Controls</Link></li>
            <li><Link href="/pricing" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-[#111111] mb-4 uppercase tracking-wider">Resources</h4>
          <ul className="space-y-3">
            <li><Link href="/docs" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Documentation</Link></li>
            <li><a href={LIVE_API_DOCS} target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">API Reference</a></li>
            <li><Link href="/security" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Security</Link></li>
            <li><a href={STATUS_URL} target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Status</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-[#111111] mb-4 uppercase tracking-wider">Company</h4>
          <ul className="space-y-3">
            <li><Link href="/about" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">About</Link></li>
            <li><Link href="/contact" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Contact</Link></li>
            <li><Link href="/privacy" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Privacy</Link></li>
            <li><Link href="/terms" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 mt-16 pt-8 border-t border-[#EEE8E2] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[13px] text-[#888888]">© 2026 WHOAI Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-[13px] text-[#888888] hover:text-[#111111]">Privacy</Link>
          <Link href="/terms" className="text-[13px] text-[#888888] hover:text-[#111111]">Terms</Link>
          <a href={STATUS_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#888888] hover:text-[#111111]">Status</a>
        </div>
      </div>
    </footer>
  );
}
