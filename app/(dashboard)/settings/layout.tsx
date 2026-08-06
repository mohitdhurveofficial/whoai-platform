"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Shield, Sliders, KeyRound } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Only routes that exist. "Team & Members" (/settings/team) was listed here
  // with no page behind it, and Billing pointed at /settings/billing while the
  // real billing page lives at /billing — both were 404s.
  const navItems = [
    { name: "General", href: "/settings", icon: Sliders },
    { name: "Providers", href: "/settings/providers", icon: Shield },
    { name: "API Keys", href: "/settings/api-keys", icon: KeyRound },
    { name: "Billing", href: "/billing", icon: CreditCard },
  ];

  return (
    <div className="pb-10 flex flex-col md:flex-row gap-10">
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-[28px] font-bold text-[#111111] mb-6 tracking-tight">Settings</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.name} href={item.href} aria-current={isActive ? "page" : undefined} className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-1 ${isActive ? "bg-[#FAF7F3] text-[#111111] border border-[#EEE8E2] shadow-sm" : "text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F3] border border-transparent"}`}>
                <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-[#FF6B00]" : "text-[#888888]"}`} /> {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 rounded-xl border border-[#EEE8E2] bg-white p-8 shadow-sm">
        {children}
      </main>
    </div>
  );
}
