"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CreditCard, Shield, Sliders } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Team & Members", href: "/settings/team", icon: Users },
    { name: "Billing & Usage", href: "/settings/billing", icon: CreditCard },
    { name: "Organization Settings", href: "#", icon: Sliders },
    { name: "Security & SSO", href: "#", icon: Shield },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-10 flex flex-col md:flex-row gap-10 min-h-screen">
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Settings</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"}`}><item.icon size={18} /> {item.name}</Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">{children}</main>
    </div>
  );
}