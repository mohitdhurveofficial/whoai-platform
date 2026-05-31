"use client";

import React, { useState, useEffect } from "react";
import WorkforceMetrics from "@/app/components/agents/WorkforceMetrics";
import WorkersTable from "@/app/components/agents/WorkersTable";
import WorkerFilters from "@/app/components/agents/WorkerFilters";
import WorkerDrawer from "@/app/components/agents/WorkerDrawer";
import { AIWorker } from "@/app/components/agents/types";
import { mockWorkers } from "@/app/components/agents/mockData";
import WorkspaceLayout from "@/app/components/layouts/WorkspaceLayout";

export default function AgentsPage() {
  const [workers, setWorkers] = useState<AIWorker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<AIWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedWorker, setSelectedWorker] = useState<AIWorker | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
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
          (worker) =>
            worker.name.toLowerCase().includes(lowerQuery) ||
            worker.department.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery, workers]);

  const handleRowClick = (worker: AIWorker) => {
    setSelectedWorker(worker);
    setIsDrawerOpen(true);
  };

  const metrics = {
    activeWorkers: workers.filter((w) => w.status === "Active").length,
    pausedWorkers: workers.filter((w) => w.status === "Paused").length,
    decisionsToday: workers.reduce(
      (acc, worker) => acc + worker.decisionsToday,
      0
    ),
    pendingApprovals: 12,
    governanceScore: 94,
  };

  return (
    <WorkspaceLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            AI Workforce
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage, monitor and govern AI workers across the organization
          </p>
        </div>

        <WorkforceMetrics
          {...metrics}
          isLoading={isLoading}
        />

        <WorkerFilters
          onSearch={setSearchQuery}
          onCreateWorker={() => console.log("Create Worker")}
        />

        <WorkersTable
          workers={filteredWorkers}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />
      </div>

      <WorkerDrawer
        worker={selectedWorker}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </WorkspaceLayout>
  );
}