import React from "react";
import { SearchBar } from "@/app/components/ui/SearchBar";

interface IdentityFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  deptFilter: string;
  onDeptFilterChange: (val: string) => void;
  riskFilter: string;
  onRiskFilterChange: (val: string) => void;
  ownerFilter: string;
  onOwnerFilterChange: (val: string) => void;
}

export function IdentityFilters({
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  deptFilter, onDeptFilterChange,
  riskFilter, onRiskFilterChange,
  ownerFilter, onOwnerFilterChange
}: IdentityFiltersProps) {
  const selectClass = "rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 min-w-[140px]";
  
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6">
      <div className="flex-1">
        <SearchBar placeholder="Search identities by Name, ID, or Description..." value={search} onChange={onSearchChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" />
      </div>
      <div className="flex flex-wrap gap-4">
        <select value={statusFilter} onChange={e => onStatusFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Dormant">Dormant</option>
          <option value="Orphaned">Orphaned</option>
          <option value="Suspended">Suspended</option>
        </select>
        <select value={deptFilter} onChange={e => onDeptFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Departments</option>
          <option value="Finance">Finance</option>
          <option value="Engineering">Engineering</option>
          <option value="Support">Support</option>
          <option value="Sales">Sales</option>
          <option value="Operations">Operations</option>
        </select>
        <select value={riskFilter} onChange={e => onRiskFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Risks</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select value={ownerFilter} onChange={e => onOwnerFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Owners</option>
          <option value="Assigned">Has Owner</option>
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>
    </div>
  );
}