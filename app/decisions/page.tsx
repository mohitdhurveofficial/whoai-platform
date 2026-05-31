"use client";

import React, { useMemo, useState, useEffect } from "react";
import DecisionMetrics from "@/app/components/decisions/DecisionMetrics";
import DecisionTable from "@/app/components/decisions/DecisionTable";
import DecisionFilters from "@/app/components/decisions/DecisionFilters";
import DecisionDrawer from "@/app/components/decisions/DecisionDrawer";
import { Decision, DecisionStatus } from "@/app/components/decisions/types";
import { mockDecisions } from "@/app/components/decisions/mockData";
import WorkspaceLayout from "@/app/components/layouts/WorkspaceLayout";
import { PageHeader } from "@/app/components/ui/PageHeader";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchDecisions = async () => {
      setIsLoading(true);

      setTimeout(() => {
        setDecisions(mockDecisions);
        setIsLoading(false);
      }, 800);
    };

    fetchDecisions();
  }, []);

  const filteredDecisions = useMemo(() => {
    if (searchQuery.trim() === "") {
      return decisions;
    }

    const lowerQuery = searchQuery.toLowerCase();

    return decisions.filter(
      (decision) =>
        decision.action.toLowerCase().includes(lowerQuery) ||
        decision.workerName.toLowerCase().includes(lowerQuery) ||
        decision.policy.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, decisions]);

  const handleRowClick = (decision: Decision) => {
    setSelectedDecision(decision);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: DecisionStatus) => {
    setDecisions((prev) => 
      prev.map((dec) => (dec.id === id ? { ...dec, status: newStatus } : dec))
    );
    
    // Update selected decision if it's the one currently open in the drawer
    setSelectedDecision((prev) => 
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    );
  };

  const metrics = {
    totalDecisions: decisions.length,
    pendingApprovals: decisions.filter((d) => d.status === "Pending").length,
    autoApproved: decisions.filter((d) => d.status === "Approved").length,
    escalated: decisions.filter((d) => d.status === "Escalated").length,
    avgConfidence: decisions.length 
      ? Math.round(decisions.reduce((acc, d) => acc + d.confidence, 0) / decisions.length) 
      : 0,
  };

  return (
    <WorkspaceLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        <PageHeader 
          title="Decisions Center" 
          subtitle="Review, approve, and audit AI actions across your organization." 
        />

        <DecisionMetrics
          {...metrics}
          isLoading={isLoading}
        />

        <DecisionFilters
          onSearch={setSearchQuery}
          onExport={() => console.log("Export Decisions")}
        />

        <DecisionTable
          decisions={filteredDecisions}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          onStatusChange={handleStatusChange}
        />
      </div>

      <DecisionDrawer
        decision={selectedDecision}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </WorkspaceLayout>
  );
}
