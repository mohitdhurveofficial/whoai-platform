"use client";
import React from "react";

type Props = {
  tabs: string[];
  activeTab?: string;
  onChange?: (tab: string) => void;
};

export function FilterTabs({ tabs = [], activeTab, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange?.(t)}
          className={`px-3 py-1 rounded ${t === activeTab ? "bg-indigo-600 text-white" : "bg-white text-slate-600"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}
