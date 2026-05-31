import React from "react";
import { SearchBar } from "@/app/components/ui/SearchBar";

interface FirewallFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export function FirewallFilters({ search, onSearchChange, statusFilter, onStatusFilterChange }: FirewallFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <SearchBar placeholder="Search by ID, Worker, or Action..." value={search} onChange={onSearchChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500"
      >
        <option value="All">All Statuses</option>
        <option value="Allowed">Allowed</option>
        <option value="Blocked">Blocked</option>
        <option value="Pending Approval">Pending Approval</option>
        <option value="Escalated">Escalated</option>
        <option value="Executed">Executed</option>
        <option value="Violation">Violation</option>
      </select>
    </div>
  );
}