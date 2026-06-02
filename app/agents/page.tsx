"use client";

import React, { useMemo, useState, useEffect } from "react";
import WorkforceMetrics from "@/app/components/agents/WorkforceMetrics";
import WorkersTable from "@/app/components/agents/WorkersTable";
import WorkerFilters from "@/app/components/agents/WorkerFilters";
import WorkerDrawer from "@/app/components/agents/WorkerDrawer";
import { Agent } from "@/app/components/agents/types";
import { mockWorkers } from "@/app/components/agents/mockData";
import WorkspaceLayout from "@/app/components/layouts/WorkspaceLayout";
import { PageHeader } from "@/app/components/ui/PageHeader";

export default function AgentsPage() {
  const [workers, setWorkers] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedWorker, setSelectedWorker] = useState<Agent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      setIsLoading(true);

      setTimeout(() => {
        setWorkers(mockWorkers);
        setIsLoading(false);
      }, 800);
    };

    fetchWorkers();
  }, []);

  const filteredWorkers = useMemo(() => {
    if (searchQuery.trim() === "") {
      return workers;
    }

    const lowerQuery = searchQuery.toLowerCase();

    return workers.filter(
      (worker) =>
        worker.name.toLowerCase().includes(lowerQuery) ||
        worker.department.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, workers]);

  const handleRowClick = (worker: Agent) => {
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
        <PageHeader 
          title="AI Workforce" 
          subtitle="Manage, monitor and govern AI workers across the organization" 
        />

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
