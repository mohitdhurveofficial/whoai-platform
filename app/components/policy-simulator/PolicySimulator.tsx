"use client";

import React, { useState, useMemo, useCallback } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { DataTable, type DataTableProps } from "@/app/components/ui/DataTable";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Download, CheckCircle, ArrowRight, Play } from "lucide-react";

/**
 * Policy Simulator
 * 
 * Allows testing policy rules against historical decisions to:
 * - Understand policy impact before deployment
 * - Identify false positives/negatives
 * - Optimize policy thresholds
 * - Generate impact reports
 */

interface SimulationResult {
  decisionId: string;
  id?: string; // For DataTable compatibility
  agentName: string;
  originalDecision: string;
  simulatedDecision: string;
  riskScore: number;
  confidence: number;
  changed: boolean;
  reason: string;
}

interface PolicySimulatorProps {
  policies?: Array<{ id: string; name: string }>;
  availableAgents?: string[];
}

export default function PolicySimulator({
  policies = [
    { id: "POL-0001", name: "Enterprise Discount Guardrail" },
    { id: "POL-0002", name: "Financial Controls Policy" },
    { id: "POL-0003", name: "Access Management Policy" },
  ],
  availableAgents = [
    "Revenue Ops Agent",
    "Fraud Detection Agent",
    "Access Control Agent",
    "Support Resolution Agent",
  ],
}: PolicySimulatorProps) {
  const [selectedPolicy, setSelectedPolicy] = useState(policies[0]?.id || "");
  const [selectedAgent, setSelectedAgent] = useState("All Agents");
  const [simulationRange, setSimulationRange] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [simulationComplete, setSimulationComplete] = useState(false);

  // Mock simulation results
  const mockResults: SimulationResult[] = useMemo(
    () => [
      {
        decisionId: "DEC-010482",
        agentName: "Revenue Ops Agent",
        originalDecision: "Approved",
        simulatedDecision: "Pending",
        riskScore: 91,
        confidence: 87,
        changed: true,
        reason: "Exceeds discount threshold under new policy",
      },
      {
        decisionId: "DEC-010481",
        agentName: "Support Resolution Agent",
        originalDecision: "Approved",
        simulatedDecision: "Approved",
        riskScore: 52,
        confidence: 94,
        changed: false,
        reason: "Within policy bounds",
      },
      {
        decisionId: "DEC-010480",
        agentName: "Fraud Detection Agent",
        originalDecision: "Rejected",
        simulatedDecision: "Rejected",
        riskScore: 88,
        confidence: 91,
        changed: false,
        reason: "High-risk decision caught by both policies",
      },
      {
        decisionId: "DEC-010479",
        agentName: "Revenue Ops Agent",
        originalDecision: "Approved",
        simulatedDecision: "Pending",
        riskScore: 78,
        confidence: 82,
        changed: true,
        reason: "New guardrail applies to this agent",
      },
      {
        decisionId: "DEC-010478",
        agentName: "Access Control Agent",
        originalDecision: "Approved",
        simulatedDecision: "Approved",
        riskScore: 34,
        confidence: 96,
        changed: false,
        reason: "Low-risk decision, policy does not affect",
      },
    ],
    []
  );

  const handleRunSimulation = useCallback(async () => {
    setIsRunning(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResults(mockResults);
    setIsRunning(false);
    setSimulationComplete(true);
  }, [mockResults]);

  const stats = useMemo(() => {
    if (results.length === 0) return null;

    const decisionChanges = results.filter((r) => r.originalDecision !== r.simulatedDecision).length;
    const falsePositives = results.filter((r) => r.originalDecision === "Approved" && r.simulatedDecision === "Rejected").length;

    return {
      totalSimulated: results.length,
      decisionImpact: decisionChanges,
      impactPercentage: Math.round((decisionChanges / results.length) * 100),
      falsePositives,
      falseNegatives: results.filter((r) => r.originalDecision === "Rejected" && r.simulatedDecision === "Approved").length,
      avgConfidence: Math.round(results.reduce((a, b) => a + b.confidence, 0) / results.length),
    };
  }, [results]);

  const columns: DataTableProps<SimulationResult>["columns"] = useMemo(
    () => [
      {
        header: "Decision ID",
        accessorKey: "decisionId",
        cell: (item: SimulationResult) => <span className="font-mono text-xs text-slate-600">{item.decisionId}</span>,
      },
      { header: "Agent", accessorKey: "agentName" },
      {
        header: "Original Decision",
        accessorKey: "originalDecision",
        cell: (item: SimulationResult) => (
          <StatusBadge
            label={item.originalDecision}
            variant={
              item.originalDecision === "Approved"
                ? "approved"
                : item.originalDecision === "Rejected"
                ? "rejected"
                : "pending"
            }
          />
        ),
      },
      {
        header: "Simulated Decision",
        accessorKey: "simulatedDecision",
        cell: (item: SimulationResult) => (
          <div className="flex items-center gap-2">
            {item.changed && <ArrowRight className="h-4 w-4 text-amber-600" />}
            <StatusBadge
              label={item.simulatedDecision}
              variant={
                item.simulatedDecision === "Approved"
                  ? "approved"
                  : item.simulatedDecision === "Rejected"
                  ? "rejected"
                  : "pending"
              }
            />
          </div>
        ),
      },
      {
        header: "Impact",
        accessorKey: "changed",
        cell: (item: SimulationResult) => (
          <span className={`text-xs font-semibold ${item.changed ? "text-amber-600" : "text-emerald-600"}`}>
            {item.changed ? "⚠ Changed" : "✓ No Change"}
          </span>
        ),
      },
      { header: "Reason", accessorKey: "reason", cell: (item: SimulationResult) => <span className="text-sm text-slate-600">{item.reason}</span> },
    ],
    []
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Policy Simulator"
        description="Test policy changes against historical decisions before deployment"
        actions={
          <button
            onClick={handleRunSimulation}
            disabled={isRunning || !selectedPolicy}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Run Simulation"}
          </button>
        }
      />

      {/* Simulation Controls */}
      <SectionCard title="Simulation Parameters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Policy to Simulate</label>
            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Filter by Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All Agents</option>
              {availableAgents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Historical Data Window</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="7"
                max="365"
                value={simulationRange}
                onChange={(e) => setSimulationRange(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{simulationRange}d</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Results Summary */}
      {simulationComplete && stats && (
        <SectionCard title="Simulation Results Summary">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Decisions Analyzed</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalSimulated}</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-4 border border-amber-200 dark:border-amber-500/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase mb-2">Decision Impact</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.decisionImpact}</p>
              <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">{stats.impactPercentage}% would change</p>
            </div>

            <div className="bg-rose-50 dark:bg-rose-500/10 rounded-lg p-4 border border-rose-200 dark:border-rose-500/20">
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase mb-2">False Positives</p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.falsePositives}</p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-4 border border-emerald-200 dark:border-emerald-500/20">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase mb-2">False Negatives</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.falseNegatives}</p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-lg p-4 border border-indigo-200 dark:border-indigo-500/20">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase mb-2">Avg. Confidence</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.avgConfidence}%</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Recommendation</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stats.falsePositives === 0
                    ? "✓ Policy is well-tuned with minimal false positives. Safe to deploy."
                    : stats.falsePositives > 5
                    ? "⚠ High false positive rate detected. Consider adjusting thresholds before deployment."
                    : "→ Review false positive cases and adjust policy rules as needed."}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Results Table */}
      {simulationComplete && results.length > 0 && (
        <SectionCard title="Detailed Results">
          <div className="mb-4 flex justify-end">
            <button className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
          <DataTable columns={columns} data={results} keyExtractor={(item) => item.decisionId} />
        </SectionCard>
      )}

      {/* Policy Rules Display */}
      <SectionCard title="Policy Rules">
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Rule 1: Discount Threshold</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">If discount &gt; 15% AND account_value &lt; $100k THEN require_approval</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">This rule applies to revenue operations and sales agents.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Rule 2: Risk Score Escalation</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">If risk_score &gt; 75 THEN escalate_to_manager</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Automatic escalation for high-risk decisions across all agents.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Rule 3: Daily Velocity Limit</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">If decisions_today &gt; 100 THEN flag_for_review</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Prevents agent decision velocity from exceeding safety thresholds.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
