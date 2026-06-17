import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import SiteNav from "@/app/components/marketing/SiteNav";
import SiteFooter from "@/app/components/marketing/SiteFooter";

export const metadata = { title: "404 — Page not found" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#111111] font-sans flex flex-col">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-24 text-center">
        <div className="max-w-[480px]">
          <p className="text-[80px] md:text-[120px] font-extrabold tracking-tight text-[#FF6B00] leading-none">
            404
          </p>
          <h1 className="text-[26px] md:text-[32px] font-extrabold tracking-tight mt-4 mb-3">
            This page wandered off budget
          </h1>
          <p className="text-[16px] text-[#666666] mb-10 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back
            on track.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-6 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md"
            >
              <Home className="h-4 w-4" /> Back home
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#EEE8E2] text-[#111111] px-6 py-3.5 rounded-md font-semibold text-[15px] hover:border-[#DCD5CD] transition-colors"
            >
              Book a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
