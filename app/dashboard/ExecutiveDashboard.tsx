"use client";

import React, { useMemo } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { DataTable, type DataTableProps } from "@/app/components/ui/DataTable";
import { RiskBadge } from "@/app/components/ui/RiskBadge";
import { TrendingUp, TrendingDown, Download, Share2, CheckCircle } from "lucide-react";

/**
 * Executive Dashboard - Board-ready reporting for C-suite visibility
 * 
 * Key features:
 * - Risk Posture Score (0-100) with trend
 * - Compliance Status Score (%), by framework
 * - Decision velocity and approval rates
 * - Incident trends and resolution times
 * - Department-level risk heatmap
 * - Export-ready reports
 */

interface ExecutiveMetric {
  label: string;
  value: string | number;
  change?: number; // percentage change
  trend?: "up" | "down" | "neutral";
  context: string;
}

interface RiskPostureData {
  score: number; // 0-100
  trend: number; // percentage change from last month
  components: {
    decisionAccuracy: number;
    policyCompliance: number;
    incidentResolution: number;
    agentGovernance: number;
  };
}

interface ComplianceScore {
  framework: string;
  id?: string; // For DataTable compatibility
  score: number; // 0-100
  controlsPassing: number;
  controlsFailing: number;
}

interface DepartmentRisk {
  department: string;
  id?: string; // For DataTable compatibility
  riskScore: number;
  decisionCount: number;
  incidentCount: number;
  approvalsRequired: number;
}

interface ExecutiveDashboardProps {
  riskPosture?: RiskPostureData;
  complianceScores?: ComplianceScore[];
  departmentRisks?: DepartmentRisk[];
}

export default function ExecutiveDashboard({
  riskPosture = {
    score: 78,
    trend: 12,
    components: {
      decisionAccuracy: 94,
      policyCompliance: 81,
      incidentResolution: 72,
      agentGovernance: 85,
    },
  },
  complianceScores = [
    { framework: "SOC 2", score: 95, controlsPassing: 76, controlsFailing: 4 },
    { framework: "ISO 27001", score: 88, controlsPassing: 112, controlsFailing: 18 },
    { framework: "GDPR", score: 92, controlsPassing: 64, controlsFailing: 6 },
    { framework: "HIPAA", score: 85, controlsPassing: 183, controlsFailing: 34 },
    { framework: "CCPA", score: 90, controlsPassing: 28, controlsFailing: 4 },
  ],
  departmentRisks = [
    { department: "Revenue Operations", riskScore: 72, decisionCount: 245, incidentCount: 8, approvalsRequired: 24 },
    { department: "Finance", riskScore: 65, decisionCount: 189, incidentCount: 5, approvalsRequired: 18 },
    { department: "Security & Compliance", riskScore: 92, decisionCount: 156, incidentCount: 3, approvalsRequired: 12 },
    { department: "Customer Success", riskScore: 58, decisionCount: 312, incidentCount: 12, approvalsRequired: 35 },
    { department: "Product Engineering", riskScore: 61, decisionCount: 278, incidentCount: 9, approvalsRequired: 21 },
  ],
}: ExecutiveDashboardProps) {
  const metrics: ExecutiveMetric[] = useMemo(() => [
    {
      label: "Risk Posture Score",
      value: riskPosture.score,
      change: riskPosture.trend,
      trend: riskPosture.trend > 0 ? "up" : "down",
      context: "0-100 scale (higher is better)",
    },
    {
      label: "Total Decisions",
      value: "1,247",
      change: 23,
      trend: "up",
      context: "Last 30 days",
    },
    {
      label: "Approval Rate",
      value: "94%",
      change: 2,
      trend: "up",
      context: "Of pending decisions",
    },
    {
      label: "Avg. Resolution Time",
      value: "4.2h",
      change: -15,
      trend: "down",
      context: "For approvals",
    },
    {
      label: "Critical Incidents",
      value: "2",
      change: -50,
      trend: "down",
      context: "Active / Unresolved",
    },
    {
      label: "Policy Violations",
      value: "18",
      change: 8,
      trend: "up",
      context: "Last 30 days",
    },
  ], [riskPosture]);

  const complianceColumns: DataTableProps<ComplianceScore>["columns"] = useMemo(
    () => [
      { header: "Framework", accessorKey: "framework" },
      {
        header: "Compliance Score",
        accessorKey: "score",
        cell: (item: ComplianceScore) => (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  item.score >= 90
                    ? "bg-emerald-500"
                    : item.score >= 75
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>
            <span className="font-semibold">{item.score}%</span>
          </div>
        ),
      },
      {
        header: "Controls Passing",
        accessorKey: "controlsPassing",
        cell: (item: ComplianceScore) => (
          <span className="text-emerald-600 font-medium">{item.controlsPassing}</span>
        ),
      },
      {
        header: "Controls Failing",
        accessorKey: "controlsFailing",
        cell: (item: ComplianceScore) => (
          <span className={`font-medium ${item.controlsFailing > 10 ? "text-rose-600" : "text-amber-600"}`}>
            {item.controlsFailing}
          </span>
        ),
      },
    ],
    []
  );

  const departmentColumns: DataTableProps<DepartmentRisk>["columns"] = useMemo(
    () => [
      { header: "Department", accessorKey: "department" },
      {
        header: "Risk Score",
        accessorKey: "riskScore",
        cell: (item: DepartmentRisk) => {
          const level = item.riskScore < 40 ? "Low" : item.riskScore < 70 ? "Medium" : item.riskScore < 85 ? "High" : "Critical";
          return <RiskBadge level={level as "Low" | "Medium" | "High" | "Critical"} />;
        },
      },
      { header: "Decisions", accessorKey: "decisionCount" },
      { header: "Incidents", accessorKey: "incidentCount" },
      { header: "Pending Approvals", accessorKey: "approvalsRequired" },
    ],
    []
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Executive Dashboard"
        description="Board-ready AI governance metrics and compliance posture"
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-all">
              <Download className="h-4 w-4" />
              Export Report
            </button>
            <button className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-all">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        }
      />

      {/* Risk Posture Overview */}
      <SectionCard title="Risk Posture & Governance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Score Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-500/20">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Risk Posture Score</h3>
                <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{riskPosture.score}</p>
              </div>
              <div className={`rounded-lg p-3 ${riskPosture.trend > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {riskPosture.trend > 0 ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Decision Accuracy</span>
                <span className="font-semibold text-slate-900 dark:text-white">{riskPosture.components.decisionAccuracy}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${riskPosture.components.decisionAccuracy}%` }} />
              </div>
              
              <div className="flex justify-between items-center text-sm mt-4">
                <span className="text-slate-600 dark:text-slate-400">Policy Compliance</span>
                <span className="font-semibold text-slate-900 dark:text-white">{riskPosture.components.policyCompliance}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${riskPosture.components.policyCompliance}%` }} />
              </div>

              <div className="flex justify-between items-center text-sm mt-4">
                <span className="text-slate-600 dark:text-slate-400">Incident Resolution</span>
                <span className="font-semibold text-slate-900 dark:text-white">{riskPosture.components.incidentResolution}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${riskPosture.components.incidentResolution}%` }} />
              </div>

              <div className="flex justify-between items-center text-sm mt-4">
                <span className="text-slate-600 dark:text-slate-400">Agent Governance</span>
                <span className="font-semibold text-slate-900 dark:text-white">{riskPosture.components.agentGovernance}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${riskPosture.components.agentGovernance}%` }} />
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.slice(1).map((metric, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">{metric.label}</p>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                  {metric.change && (
                    <span className={`text-xs font-semibold ${metric.change > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {metric.change > 0 ? "↑" : "↓"} {Math.abs(metric.change)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{metric.context}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Compliance Scores */}
      <SectionCard title="Compliance Framework Scores">
        <DataTable columns={complianceColumns} data={complianceScores} keyExtractor={(item) => item.framework} />
      </SectionCard>

      {/* Department Risk Heatmap */}
      <SectionCard title="Department Risk Assessment">
        <DataTable columns={departmentColumns} data={departmentRisks} keyExtractor={(item) => item.department} />
      </SectionCard>

      {/* Export & Certifications */}
      <SectionCard title="Compliance Certifications">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {complianceScores.map((score) => (
            <div key={score.framework} className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 mb-3 mx-auto">
                <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{score.framework}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">{score.score}% Compliant</p>
              <button className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                View Evidence
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
