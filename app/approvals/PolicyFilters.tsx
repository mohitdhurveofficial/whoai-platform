import React from "react";
import { SearchBar } from "@/app/components/ui/SearchBar";

interface PolicyFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (val: string) => void;
}

export function PolicyFilters({ search, onSearchChange, departmentFilter, onDepartmentFilterChange }: PolicyFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <SearchBar placeholder="Search policies by name, description, or owner..." value={search} onChange={onSearchChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" />
      </div>
      <select
        value={departmentFilter}
        onChange={(e) => onDepartmentFilterChange(e.target.value)}
        className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500"
      >
        <option value="All">All Departments</option>
        <option value="Security">Security</option>
        <option value="Finance">Finance</option>
        <option value="Procurement">Procurement</option>
        <option value="Legal">Legal</option>
        <option value="HR">HR</option>
      </select>
    </div>
  );
}