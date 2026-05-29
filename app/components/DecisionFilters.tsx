"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { DecisionStatus, RiskLevel } from "@/lib/mockData";

export type DecisionFilter = "All" | RiskLevel | DecisionStatus;

type Props = {
  activeFilter: DecisionFilter;
  search: string;
  onFilterChange: (filter: DecisionFilter) => void;
  onSearchChange: (search: string) => void;
};

const filters: DecisionFilter[] = [
  "All",
  "High Risk",
  "Medium Risk",
  "Low Risk",
  "Approved",
  "Rejected",
];

export default function DecisionFilters({
  activeFilter,
  search,
  onFilterChange,
  onSearchChange,
}: Props) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white/82 p-4 shadow-[0_18px_50px_rgba(7,17,38,0.045)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative flex min-h-12 flex-1 items-center">
          <Search className="absolute left-4 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by decision, agent, policy, or ID"
            className="h-12 w-full rounded-2xl border border-black/5 bg-[#fbf8f2] pl-11 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-100"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 hidden items-center gap-2 text-sm font-semibold text-slate-500 md:flex">
            <SlidersHorizontal size={16} />
            Filters
          </div>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange(filter)}
              className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
                activeFilter === filter
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                  : "bg-white text-slate-600 ring-1 ring-black/5 hover:text-slate-950"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
