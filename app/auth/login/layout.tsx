"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/auth/login") {
    return <>{children}</>;
  }

  return (
    <div className="texture flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[18px] border border-black/5 bg-white/88 p-6 shadow-[0_22px_60px_rgba(7,17,38,0.11)]">
        {children}
      </div>
    </div>
  );
}