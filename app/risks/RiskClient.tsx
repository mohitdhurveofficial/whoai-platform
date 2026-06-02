"use client";

import React, { useState, useMemo, useCallback } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { RiskMetrics } from "./RiskMetrics";
import { RiskFilters } from "./RiskFilters";
import { RiskTable } from "./RiskTable";
import { RiskDrawer } from "./RiskDrawer";
import { RiskHeatmap } from "./RiskHeatmap";
import { RiskTrendChart } from "./RiskTrendChart";
import { RiskAlertFeed } from "./RiskAlertFeed";
import { mockRiskEvents, mockRiskAlerts } from "./mockData";
import { SectionCard } from "@/app/components/ui/SectionCard";
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

  const handleViewDetails = useCallback((e: RiskEvent) => {
    setActiveEvent(e);
    setDrawerOpen(true);
  }, []);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Top Violated Policies">
           <div className="space-y-4 mt-2">
             {[
               { name: "Production DB Write Access", violations: 45, trend: "+12%" },
               { name: "Unapproved IAM Role Assumption", violations: 32, trend: "+5%" },
               { name: "PII Data Exfiltration Check", violations: 18, trend: "-2%" }
             ].map((policy, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                 <span className="text-sm font-semibold text-slate-900 dark:text-white">{policy.name}</span>
                 <div className="flex items-center gap-3 text-sm">
                   <span className="font-medium text-rose-600">{policy.violations} violations</span>
                   <span className="text-xs text-slate-500">{policy.trend}</span>
                 </div>
               </div>
             ))}
           </div>
        </SectionCard>
        <SectionCard title="Most Risky Agents">
           <div className="space-y-4 mt-2">
             {[
               { name: "DataSync-Prod-01", score: 92, escalations: 14 },
               { name: "EmailCampaign-Agent", score: 85, escalations: 9 },
               { name: "CodeDeploy-Worker", score: 78, escalations: 5 }
             ].map((agent, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                 <span className="text-sm font-semibold text-slate-900 dark:text-white">{agent.name}</span>
                 <div className="flex items-center gap-3 text-sm">
                   <span className="font-medium text-amber-600">Risk Score: {agent.score}</span>
                   <span className="text-xs text-slate-500">{agent.escalations} escalations</span>
                 </div>
               </div>
             ))}
           </div>
        </SectionCard>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <div className="mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Risk Events</h3></div>
        <RiskFilters search={search} onSearchChange={setSearch} severityFilter={severityFilter} onSeverityFilterChange={setSeverityFilter} />
        <RiskTable data={filteredData} onViewDetails={handleViewDetails} />
      </div>
      <RiskDrawer isOpen={drawerOpen} event={activeEvent} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}