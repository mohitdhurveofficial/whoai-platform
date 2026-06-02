"use client";

import React, { useState, useMemo, useCallback } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { DataTable, type DataTableProps } from "@/app/components/ui/DataTable";
import { Download, Eye, Share2, Lock, FileText, Package, CheckCircle } from "lucide-react";

/**
 * Evidence Vault
 * 
 * Centralized audit evidence management and export for compliance:
 * - SOC 2, ISO 27001, HIPAA, GDPR, CCPA, EU AI Act evidence
 * - Decision audit trails
 * - Policy compliance records
 * - Incident investigations
 * - Downloadable compliance packages
 */

interface EvidenceItem {
  id: string;
  framework: string;
  type: string;
  title: string;
  generatedAt: Date;
  size: string;
  status: "ready" | "processing" | "archived";
  cryptoHash: string;
  policyReferences: string[];
}

interface EvidenceVaultProps {
  frameworks?: Array<{ name: string; count: number }>;
}

export default function EvidenceVault({
  frameworks = [
    { name: "SOC 2 Type II", count: 156 },
    { name: "ISO 27001", count: 112 },
    { name: "HIPAA", count: 89 },
    { name: "GDPR", count: 203 },
    { name: "CCPA", count: 67 },
    { name: "EU AI Act", count: 34 },
  ],
}: EvidenceVaultProps) {
  const [selectedFramework, setSelectedFramework] = useState("SOC 2 Type II");
  const [selectedType, setSelectedType] = useState<"all" | "decisions" | "policies" | "incidents">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock evidence items
  const evidenceItems: EvidenceItem[] = useMemo(
    () => [
      {
        id: "EVD-000451",
        framework: "SOC 2 Type II",
        type: "Decision Audit Trail",
        title: "Decision DEC-010482 - Complete Audit Trail",
        generatedAt: new Date("2026-05-29"),
        size: "2.4 MB",
        status: "ready",
        cryptoHash: "sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
        policyReferences: ["POL-0001", "POL-0042"],
      },
      {
        id: "EVD-000450",
        framework: "SOC 2 Type II",
        type: "Policy Compliance",
        title: "Enterprise Discount Guardrail - 30 Day Compliance Report",
        generatedAt: new Date("2026-05-28"),
        size: "1.8 MB",
        status: "ready",
        cryptoHash: "sha256:q9w8e7r6t5y4u3i2o1p0a9s8d7f6g5h4",
        policyReferences: ["POL-0001"],
      },
      {
        id: "EVD-000449",
        framework: "GDPR",
        type: "Incident Investigation",
        title: "INC-0051 - Data Access Incident Investigation",
        generatedAt: new Date("2026-05-27"),
        size: "4.2 MB",
        status: "ready",
        cryptoHash: "sha256:z1x2c3v4b5n6m7q8w9e0r1t2y3u4i5o6",
        policyReferences: ["POL-0015", "POL-0023", "POL-0034"],
      },
      {
        id: "EVD-000448",
        framework: "ISO 27001",
        type: "Access Control Log",
        title: "Access Control - May 2026 Comprehensive Log",
        generatedAt: new Date("2026-05-26"),
        size: "8.7 MB",
        status: "ready",
        cryptoHash: "sha256:p0o9i8u7y6t5r4e3w2q1a0s9d8f7g6h5",
        policyReferences: ["POL-0008", "POL-0009"],
      },
      {
        id: "EVD-000447",
        framework: "HIPAA",
        type: "Decision Audit Trail",
        title: "Healthcare Data Access - Complete Trail",
        generatedAt: new Date("2026-05-25"),
        size: "3.1 MB",
        status: "ready",
        cryptoHash: "sha256:j4k3l2m1n0o9p8q7r6s5t4u3v2w1x0y9",
        policyReferences: ["POL-0019", "POL-0020"],
      },
      {
        id: "EVD-000446",
        framework: "CCPA",
        type: "Data Access Request",
        title: "CCPA Subject Access Request - April 2026",
        generatedAt: new Date("2026-05-24"),
        size: "1.2 MB",
        status: "ready",
        cryptoHash: "sha256:m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0",
        policyReferences: ["POL-0025"],
      },
    ],
    []
  );

  const filteredItems = useMemo(() => {
    return evidenceItems.filter((item) => {
      const matchesFramework = item.framework === selectedFramework;
      const matchesType = selectedType === "all" || item.type.toLowerCase().includes(selectedType);
      const matchesSearch = searchQuery === "" || item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFramework && matchesType && matchesSearch;
    });
  }, [selectedFramework, selectedType, searchQuery, evidenceItems]);

  const columns: DataTableProps<EvidenceItem>["columns"] = useMemo(
    () => [
      {
        header: "Title",
        accessorKey: "title",
        cell: (item: EvidenceItem) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {item.id}</p>
          </div>
        ),
      },
      { header: "Type", accessorKey: "type", cell: (item: EvidenceItem) => <span className="text-sm">{item.type}</span> },
      {
        header: "Generated",
        accessorKey: "generatedAt",
        cell: (item: EvidenceItem) => <span className="text-sm">{item.generatedAt.toLocaleDateString()}</span>,
      },
      { header: "Size", accessorKey: "size" },
      {
        header: "Status",
        accessorKey: "status",
        cell: (item: EvidenceItem) => (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            item.status === "ready"
              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
          }`}>
            <CheckCircle className="h-3 w-3" />
            {item.status === "ready" ? "Ready" : "Processing"}
          </span>
        ),
      },
      {
        header: "",
        cell: () => (
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="View">
              <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Download">
              <Download className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const handleExportPackage = useCallback(() => {
    alert(`Exporting ${selectedFramework} compliance package...`);
  }, [selectedFramework]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Evidence Vault"
        description="Centralized audit evidence management for compliance and governance"
        actions={
          <button
            onClick={handleExportPackage}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-all"
          >
            <Package className="h-4 w-4" />
            Export Package
          </button>
        }
      />

      {/* Compliance Framework Breakdown */}
      <SectionCard title="Compliance Frameworks">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {frameworks.map((fw) => (
            <button
              key={fw.name}
              onClick={() => setSelectedFramework(fw.name)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                selectedFramework === fw.name
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{fw.name}</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{fw.count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">records</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Filters */}
      <SectionCard title="Search & Filter">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as "all" | "decisions" | "policies" | "incidents")}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="decisions">Decisions</option>
            <option value="policies">Policies</option>
            <option value="incidents">Incidents</option>
          </select>
        </div>
      </SectionCard>

      {/* Evidence Items */}
      <SectionCard title={`Evidence for ${selectedFramework} (${filteredItems.length} records)`}>
        <DataTable columns={columns} data={filteredItems} keyExtractor={(item) => item.id} />
      </SectionCard>

      {/* Cryptographic Verification */}
      <SectionCard title="Cryptographic Verification">
        <div className="space-y-3">
          {filteredItems.slice(0, 2).map((item) => (
            <div key={item.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 font-mono text-xs">
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 text-slate-600 dark:text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 break-all">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">{item.id}</p>
                <p className="text-slate-600 dark:text-slate-400">{item.cryptoHash}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Export Options */}
      <SectionCard title="Export & Sharing Options">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="text-left p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">PDF Report</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Board-ready PDF with all evidence</p>
          </button>

          <button className="text-left p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">ZIP Package</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Complete audit bundle with all records</p>
          </button>

          <button className="text-left p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Share2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Share Link</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Secure sharing with external auditors</p>
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
