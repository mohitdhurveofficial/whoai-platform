"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { FirewallMetrics } from "./FirewallMetrics";
import { FirewallFilters } from "./FirewallFilters";
import { FirewallTable } from "./FirewallTable";
import { FirewallDrawer } from "./FirewallDrawer";
import { mockFirewallDecisions } from "./mockData";
import type { FirewallDecision } from "./types";

export function FirewallClient() {
  const [data] = useState<FirewallDecision[]>(mockFirewallDecisions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDecision, setActiveDecision] = useState<FirewallDecision | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.action.toLowerCase().includes(search.toLowerCase()) ||
                            item.workerName.toLowerCase().includes(search.toLowerCase()) ||
                            item.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.firewallStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const handleViewDetails = (decision: FirewallDecision) => {
    setActiveDecision(decision);
    setDrawerOpen(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
      <PageHeader
        title="Decision Firewall™"
        description="The central nervous system of WHOAI. Governance and evaluation at the point of action."
      />

      <FirewallMetrics data={data} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <FirewallFilters search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />

        <FirewallTable data={filteredData} onViewDetails={handleViewDetails} />
      </div>

      <FirewallDrawer isOpen={drawerOpen} decision={activeDecision} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}