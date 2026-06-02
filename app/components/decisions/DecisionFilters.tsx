import React from "react";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface DecisionFiltersProps {
  onSearch: (query: string) => void;
  onExport: () => void;
}

export default function DecisionFilters({ onSearch, onExport }: DecisionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search decisions, workers, or policies..." 
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button variant="secondary" icon={Filter} className="w-full sm:w-auto">
          Filters
        </Button>
        <Button variant="secondary" icon={Download} onClick={onExport} className="w-full sm:w-auto">
          Export
        </Button>
      </div>
    </div>
  );
}