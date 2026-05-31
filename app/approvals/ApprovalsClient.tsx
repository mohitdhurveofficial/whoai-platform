"use client";

import React, { useState, useMemo } from "react";
import { approvals as mockApprovals } from "@/lib/mockData";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/Button";
import { ApprovalMetrics } from "@/app/components/ui/ApprovalMetrics";
import { ApprovalFilters } from "@/app/components/ui/ApprovalFilters";
import { ApprovalTable } from "@/app/components/ui/ApprovalTable";
import { ApprovalDrawer } from "@/app/components/ui/ApprovalDrawer";
import type { ExtendedApproval, ApprovalStatus } from "@/app/components/ui/types";
import { CheckCircle2, XCircle } from "lucide-react";

const initialData: ExtendedApproval[] = mockApprovals.map((app, index) => ({
  ...app,
  status: "Pending",
  sla: index === 0 ? "45m remaining" : index === 1 ? "1h 20m remaining" : "3h 00m remaining",
}));

export function ApprovalsClient() {
  const [data, setData] = useState<ExtendedApproval[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeApproval, setActiveApproval] = useState<ExtendedApproval | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.request.toLowerCase().includes(search.toLowerCase()) ||
                            item.agent.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleViewDetails = (approval: ExtendedApproval) => {
    setActiveApproval(approval);
    setDrawerOpen(true);
  };

  const handleUpdateStatus = (id: string, status: ApprovalStatus) => {
    setData(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    setSelectedIds(new Set());
    if (activeApproval?.id === id) {
      setDrawerOpen(false);
    }
  };

  const handleBulkAction = (status: ApprovalStatus) => {
    setData(prev => prev.map(app => selectedIds.has(app.id) ? { ...app, status } : app));
    setSelectedIds(new Set());
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Approvals Center"
        description="Review, approve, or escalate AI workforce decisions requiring human oversight."
      />

      <ApprovalMetrics />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <ApprovalFilters search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />

        {selectedIds.size > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-900/50">
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              {selectedIds.size} request(s) selected
            </span>
            <div className="flex gap-3">
              <Button variant="primary" icon={CheckCircle2} onClick={() => handleBulkAction("Approved")}>Approve Selected</Button>
              <Button variant="danger" icon={XCircle} onClick={() => handleBulkAction("Rejected")}>Reject Selected</Button>
            </div>
          </div>
        )}

        <ApprovalTable data={filteredData} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} onViewDetails={handleViewDetails} />
      </div>

      <ApprovalDrawer isOpen={drawerOpen} approval={activeApproval} onClose={() => setDrawerOpen(false)} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
}