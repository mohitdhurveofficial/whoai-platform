"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#111111] font-sans flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6 py-24 text-center">
        <div className="max-w-[480px]">
          <p className="text-[64px] md:text-[88px] font-extrabold tracking-tight text-[#FF6B00] leading-none">
            Oops
          </p>
          <h1 className="text-[26px] md:text-[32px] font-extrabold tracking-tight mt-4 mb-3">
            Something went wrong
          </h1>
          <p className="text-[16px] text-[#666666] mb-10 leading-relaxed">
            An unexpected error popped up on our end. Try reloading the page, or head back
            home and we&apos;ll get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-6 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md"
            >
              <RotateCcw className="h-4 w-4" /> Reload
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#EEE8E2] text-[#111111] px-6 py-3.5 rounded-md font-semibold text-[15px] hover:border-[#DCD5CD] transition-colors"
            >
              <Home className="h-4 w-4" /> Back home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
