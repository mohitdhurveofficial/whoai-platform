"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { IdentityMetrics } from "./IdentityMetrics";
import { IdentityFilters } from "./IdentityFilters";
import { IdentityTable } from "./IdentityTable";
import { IdentityDrawer } from "./IdentityDrawer";
import { mockIdentities } from "./mockData";
import type { WorkerIdentity } from "./types";

export function IdentityClient() {
  const [data] = useState<WorkerIdentity[]>(mockIdentities);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIdentity, setActiveIdentity] = useState<WorkerIdentity | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                            item.id.toLowerCase().includes(search.toLowerCase()) ||
                            item.owner.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesDept = deptFilter === "All" || item.department === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [data, search, statusFilter, deptFilter]);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
      <PageHeader 
        title="Identity Center" 
        description="System of record for AI worker ownership, access controls, permissions, and accountability." 
      />
      
      <IdentityMetrics data={data} />
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <IdentityFilters search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} deptFilter={deptFilter} onDeptFilterChange={setDeptFilter} />
        <IdentityTable data={filteredData} onViewDetails={(w) => { setActiveIdentity(w); setDrawerOpen(true); }} />
      </div>

      <IdentityDrawer isOpen={drawerOpen} identity={activeIdentity} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}