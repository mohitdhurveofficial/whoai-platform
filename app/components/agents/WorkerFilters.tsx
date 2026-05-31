import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface WorkerFiltersProps {
  onSearch: (query: string) => void;
  onCreateWorker: () => void;
}

export default function WorkerFilters({ onSearch, onCreateWorker }: WorkerFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search workers by name or department..." 
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <Filter className="h-4 w-4" />
          Filters
        </button>
        <button onClick={onCreateWorker} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
          <Plus className="h-4 w-4" />
          Create Worker
        </button>
      </div>
    </div>
  );
}