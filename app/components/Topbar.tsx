"use client";

import { Bell, ChevronDown, Search, ShieldCheck } from "lucide-react";
import NotificationMenu from "./ui/NotificationMenu";
import UserMenu from "./ui/UserMenu";
import { SearchBar } from "./ui/SearchBar";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-4 sm:px-6 md:px-8 lg:px-10">
        <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-sky-600" />
          <span>Enterprise</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <SearchBar placeholder="Search agents, policies, approvals..." />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <NotificationMenu />
          <button className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 md:inline-flex">
            Organization: Atlas AI
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
