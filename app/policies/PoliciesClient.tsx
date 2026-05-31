"use client";

import React, { useState, useMemo } from "react";
import { mockPolicies } from "@/app/approvals/mockData";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { PolicyMetrics } from "@/app/approvals/PolicyMetrics";
import { PolicyFilters } from "@/app/approvals/PolicyFilters";
import { PolicyTable } from "@/app/approvals/PolicyTable";
import { PolicyDrawer } from "@/app/approvals/PolicyDrawer";
import type { ExtendedPolicy } from "@/app/approvals/types";
import { Button } from "@/app/components/ui/Button";
import { Plus } from "lucide-react";

export function PoliciesClient() {
  const [data, setData] = useState<ExtendedPolicy[]>(mockPolicies);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<ExtendedPolicy | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                            item.description.toLowerCase().includes(search.toLowerCase()) ||
                            item.owner.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === "All" || item.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [data, search, departmentFilter]);

  const handleViewDetails = (policy: ExtendedPolicy) => {
    setActivePolicy(policy);
    setDrawerOpen(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <PageHeader title="Policies Center" description="Define risk controls, operational guardrails, and compliance requirements for AI Workers." />
        <Button variant="primary" icon={Plus}>Create Policy</Button>
      </div>

      <PolicyMetrics />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Guardrails</h3>
        </div>
        <PolicyFilters search={search} onSearchChange={setSearch} departmentFilter={departmentFilter} onDepartmentFilterChange={setDepartmentFilter} />
        <PolicyTable data={filteredData} onViewDetails={handleViewDetails} />
      </div>

      <PolicyDrawer isOpen={drawerOpen} policy={activePolicy} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}