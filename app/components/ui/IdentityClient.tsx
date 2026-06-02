"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { IdentityMetrics } from "./IdentityMetrics";
import { IdentityFilters } from "./IdentityFilters";
import { IdentityTable } from "./IdentityTable";
import { IdentityDrawer } from "./IdentityDrawer";
import { mockIdentities } from "./mockData";
import type { AIIdentity } from "./types";

export function IdentityClient() {
  const [data] = useState<AIIdentity[]>(mockIdentities);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIdentity, setActiveIdentity] = useState<AIIdentity | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                            item.id.toLowerCase().includes(search.toLowerCase()) ||
                            item.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesDept = deptFilter === "All" || item.department === deptFilter;
      const matchesRisk = riskFilter === "All" || item.riskLevel === riskFilter;
      const matchesOwner = ownerFilter === "All" || (ownerFilter === "Unassigned" ? item.owner === "Unassigned" : item.owner !== "Unassigned");
      return matchesSearch && matchesStatus && matchesDept && matchesRisk && matchesOwner;
    });
  }, [data, search, statusFilter, deptFilter, riskFilter, ownerFilter]);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
      <PageHeader 
        title="Identity & Access Center" 
        description="The Okta-equivalent console for AI workers. Manage identities, credentials, permissions, and access policies centrally." 
      />
      
      <IdentityMetrics data={data} />
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <IdentityFilters search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} deptFilter={deptFilter} onDeptFilterChange={setDeptFilter} riskFilter={riskFilter} onRiskFilterChange={setRiskFilter} ownerFilter={ownerFilter} onOwnerFilterChange={setOwnerFilter} />
        <IdentityTable data={filteredData} onViewDetails={(w) => { setActiveIdentity(w); setDrawerOpen(true); }} />
      </div>
      <IdentityDrawer isOpen={drawerOpen} identity={activeIdentity} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}