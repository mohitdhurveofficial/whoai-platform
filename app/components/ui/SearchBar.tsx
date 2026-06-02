"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function SearchBar({ placeholder = "Search...", value, onChange, className = "" }: SearchBarProps) {
  return (
    <label className={`flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-500 shadow-sm transition focus-within:border-orange-300 focus-within:ring-3 focus-within:ring-orange-500/15 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 ${className}`}>
      <Search className="h-4 w-4 text-slate-400" />
      <input
        className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}
