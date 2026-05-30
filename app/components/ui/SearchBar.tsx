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
    <label className={`flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-500 shadow-sm shadow-slate-200/40 ${className}`}>
      <Search className="h-4 w-4 text-slate-400" />
      <input
        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}
