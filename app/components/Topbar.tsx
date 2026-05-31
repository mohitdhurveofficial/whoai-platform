"use client";

import { ChevronDown, ShieldCheck } from "lucide-react";
import NotificationMenu from "./ui/NotificationMenu";
import UserMenu from "./ui/UserMenu";
import { SearchBar } from "./ui/SearchBar";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/88 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/88">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 md:px-8 lg:px-10">
        <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:flex">
          <ShieldCheck className="h-4 w-4 text-orange-600 dark:text-orange-300" />
          <span>Enterprise</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <SearchBar placeholder="Search agents, policies, approvals..." />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <NotificationMenu />
          <button className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-orange-400/30 dark:hover:bg-orange-500/10 md:inline-flex">
            Organization: Atlas AI
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
