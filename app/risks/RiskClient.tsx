"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { RiskMetrics } from "./RiskMetrics";
import { RiskFilters } from "./RiskFilters";
import { RiskTable } from "./RiskTable";
import { RiskDrawer } from "./RiskDrawer";
import { RiskHeatmap } from "./RiskHeatmap";
import { RiskTrendChart } from "./RiskTrendChart";
import { RiskAlertFeed } from "./RiskAlertFeed";
import { mockRiskEvents, mockRiskAlerts } from "./mockData";
import type { RiskEvent } from "./types";

export function RiskClient() {
  const [data] = useState<RiskEvent[]>(mockRiskEvents);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<RiskEvent | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.workerName.toLowerCase().includes(search.toLowerCase()) ||
                            item.id.toLowerCase().includes(search.toLowerCase()) ||
                            item.riskType.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [data, search, severityFilter]);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20">
      <PageHeader title="Risk Center" description="Enterprise control room for monitoring systemic AI risk and policy violations." />
      <RiskMetrics data={data} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <RiskHeatmap />
          <RiskTrendChart />
        </div>
        <div className="lg:col-span-1 h-full">
          <RiskAlertFeed alerts={mockRiskAlerts} />
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <div className="mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Risk Events</h3></div>
        <RiskFilters search={search} onSearchChange={setSearch} severityFilter={severityFilter} onSeverityFilterChange={setSeverityFilter} />
        <RiskTable data={filteredData} onViewDetails={(e) => { setActiveEvent(e); setDrawerOpen(true); }} />
      </div>
      <RiskDrawer isOpen={drawerOpen} event={activeEvent} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}