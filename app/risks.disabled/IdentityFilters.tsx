import React from "react";
import { SearchBar } from "@/app/components/ui/SearchBar";

interface IdentityFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  deptFilter: string;
  onDeptFilterChange: (val: string) => void;
}

export function IdentityFilters({ search, onSearchChange, statusFilter, onStatusFilterChange, deptFilter, onDeptFilterChange }: IdentityFiltersProps) {
  const selectClass = "rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500";
  
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6">
      <div className="flex-1">
        <SearchBar placeholder="Search by Name, ID, or Owner..." value={search} onChange={onSearchChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" />
      </div>
      <div className="flex flex-wrap gap-4">
        <select value={statusFilter} onChange={e => onStatusFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Dormant">Dormant</option>
          <option value="Shadow">Shadow</option>
          <option value="Archived">Archived</option>
        </select>
        <select value={deptFilter} onChange={e => onDeptFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Departments</option>
          <option value="Finance">Finance</option>
          <option value="Engineering">Engineering</option>
          <option value="Support">Support</option>
          <option value="Sales">Sales</option>
          <option value="Operations">Operations</option>
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>
    </div>
  );
}