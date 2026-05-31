"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import { Search, Bell } from "lucide-react";
import WorkforceMetrics from "@/app/components/agents/WorkforceMetrics";
import WorkersTable from "@/app/components/agents/WorkersTable";
import WorkerFilters from "@/app/components/agents/WorkerFilters";
import WorkerDrawer from "@/app/components/agents/WorkerDrawer";
import { AIWorker } from "@/app/components/agents/types";
import { mockWorkers } from "@/app/components/agents/mockData";

export default function AgentsPage() {
  const [workers, setWorkers] = useState<AIWorker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<AIWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedWorker, setSelectedWorker] = useState<AIWorker | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const fetchWorkers = async () => {
      setIsLoading(true);
      setTimeout(() => {
        setWorkers(mockWorkers);
        setFilteredWorkers(mockWorkers);
        setIsLoading(false);
      }, 800);
    };
    
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWorkers(workers);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredWorkers(
        workers.filter(
          (w) =>
            w.name.toLowerCase().includes(lowerQuery) ||
            w.department.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery, workers]);

  const handleRowClick = (worker: AIWorker) => {
    setSelectedWorker(worker);
    setIsDrawerOpen(true);
  };

  const metrics = {
    activeWorkers: workers.filter(w => w.status === 'Active').length,
    pausedWorkers: workers.filter(w => w.status === 'Paused').length,
    decisionsToday: workers.reduce((acc, w) => acc + w.decisionsToday, 0),
    pendingApprovals: 12, // Mocked pending approvals
    governanceScore: 94,
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden w-full">
      {/* Existing Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Command Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 flex items-center">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources... (Cmd+K)" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm cursor-pointer">
              WA
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="p-6 max-w-[1600px] mx-auto">
            
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Workforce</h1>
              <p className="text-sm text-slate-500 mt-1">Manage, monitor and govern AI workers across the organization</p>
            </div>

            <WorkforceMetrics {...metrics} isLoading={isLoading} />
            
            <WorkerFilters 
              onSearch={setSearchQuery} 
              onCreateWorker={() => console.log('Create Worker')} 
            />
            
            <WorkersTable 
              workers={filteredWorkers} 
              isLoading={isLoading} 
              onRowClick={handleRowClick}
            />

          </div>
        </main>
      </div>

      <WorkerDrawer 
        worker={selectedWorker} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
