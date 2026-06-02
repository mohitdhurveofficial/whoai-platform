import React from "react";
import { SearchBar } from "@/app/components/ui/SearchBar";

interface RegistryFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  deptFilter: string;
  onDeptFilterChange: (val: string) => void;
  riskFilter: string;
  onRiskFilterChange: (val: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (val: string) => void;
}

export function RegistryFilters({
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  deptFilter, onDeptFilterChange,
  riskFilter, onRiskFilterChange,
  platformFilter, onPlatformFilterChange
}: RegistryFiltersProps) {
  const selectClass = "rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500";
  
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6">
      <div className="flex-1">
        <SearchBar placeholder="Search by ID, Name, Owner, or Department..." value={search} onChange={onSearchChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" />
      </div>
      <div className="flex flex-wrap gap-4">
        <select value={statusFilter} onChange={e => onStatusFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Archived">Archived</option>
        </select>
        <select value={deptFilter} onChange={e => onDeptFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Depts</option>
          <option value="Finance">Finance</option>
          <option value="Engineering">Engineering</option>
          <option value="Support">Support</option>
        </select>
        <select value={riskFilter} onChange={e => onRiskFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Risks</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select value={platformFilter} onChange={e => onPlatformFilterChange(e.target.value)} className={selectClass}>
          <option value="All">All Platforms</option>
          <option value="OpenAI">OpenAI</option>
          <option value="Anthropic">Anthropic</option>
          <option value="AWS Bedrock">AWS Bedrock</option>
        </select>
      </div>
    </div>
  );
}