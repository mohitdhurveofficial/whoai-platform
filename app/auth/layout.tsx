"use client";

import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/auth/login" || pathname === "/auth/signup") {
    return children;
  }

  return (
    <div className="texture flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[18px] border border-black/5 bg-white/88 p-6 shadow-[0_22px_60px_rgba(7,17,38,0.11)]">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="shield-logo h-12 w-10 bg-[#071126]" />
          </div>
          <h1 className="text-3xl font-black text-[#071126]">WHOAI</h1>
          <p className="mt-2 font-medium text-[#071126]/60">AI FinOps &amp; governance control plane</p>
        </div>

        {children}
      </div>
    </div>
  );
}
