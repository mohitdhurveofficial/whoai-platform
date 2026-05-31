"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { RegistryMetrics } from "./RegistryMetrics";
import { RegistryFilters } from "./RegistryFilters";
import { RegistryTable } from "./RegistryTable";
import { RegistryDrawer } from "./RegistryDrawer";
import { Button } from "@/app/components/ui/Button";
import { Plus } from "lucide-react";
import { mockWorkers } from "./mockData";

type AIWorker = (typeof mockWorkers)[number];

export function RegistryClient() {
  const [data] = useState<AIWorker[]>(mockWorkers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeWorker, setActiveWorker] = useState<AIWorker | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                            item.id.toLowerCase().includes(search.toLowerCase()) ||
                            item.owner.toLowerCase().includes(search.toLowerCase()) ||
                            item.department.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesDept = deptFilter === "All" || item.department === deptFilter;
      const matchesRisk = riskFilter === "All" || item.riskLevel === riskFilter;
      const matchesPlatform = platformFilter === "All" || item.platform === platformFilter;
      return matchesSearch && matchesStatus && matchesDept && matchesRisk && matchesPlatform;
    });
  }, [data, search, statusFilter, deptFilter, riskFilter, platformFilter]);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
      <PageHeader 
        title="Agent Registry" 
        description="The central enterprise inventory for every AI Worker." 
        actions={
          <Button variant="primary" icon={Plus}>
            Register Agent
          </Button>
        }
      />
      <RegistryMetrics data={data} />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <RegistryFilters 
          search={search} onSearchChange={setSearch} 
          statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
          deptFilter={deptFilter} onDeptFilterChange={setDeptFilter}
          riskFilter={riskFilter} onRiskFilterChange={setRiskFilter}
          platformFilter={platformFilter} onPlatformFilterChange={setPlatformFilter}
        />
        <RegistryTable data={filteredData} onViewDetails={(w) => { setActiveWorker(w); setDrawerOpen(true); }} />
      </div>
      <RegistryDrawer isOpen={drawerOpen} worker={activeWorker} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}