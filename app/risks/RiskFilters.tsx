import React from "react";
import { SearchBar } from "@/app/components/ui/SearchBar";

interface RiskFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (val: string) => void;
}

export function RiskFilters({ search, onSearchChange, severityFilter, onSeverityFilterChange }: RiskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <SearchBar placeholder="Search risks by ID, worker, or type..." value={search} onChange={onSearchChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" />
      </div>
      <select
        value={severityFilter}
        onChange={(e) => onSeverityFilterChange(e.target.value)}
        className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500"
      >
        <option value="All">All Severities</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
  );
}