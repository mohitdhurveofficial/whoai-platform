"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { KpiCard } from "@/app/components/ui/KpiCard";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { Button } from "@/app/components/ui/Button";
import { BrainCircuit, ShieldCheck, Download, Presentation, FileText, Activity } from "lucide-react";

export function ReportsClient() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (reportName: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Successfully compiled and exported: ${reportName} (PDF)`);
    }, 1500);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20 p-6 md:p-10">
      <PageHeader 
        title="Enterprise Trust Dashboard" 
        description="Boardroom-ready executive reporting and continuous compliance posture." 
        actions={<Button variant="primary" icon={Download} onClick={() => handleExport("Executive Board Deck")}>{isExporting ? "Generating Deck..." : "Export Executive Deck"}</Button>}
      />

      {/* AI Summary Block */}
      <div className="bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={160} /></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
            <BrainCircuit className="text-blue-400" /> What happened today?
          </h2>
          <p className="text-slate-300 leading-relaxed text-lg max-w-4xl">
            WHOAI governed <strong className="text-white">4,231 AI agent decisions</strong> across 14 departments today. 
            <strong className="text-rose-400"> 12 actions were blocked</strong> by the Decision Firewall, successfully preventing a high-risk PII exfiltration event by the <span className="font-mono bg-white/10 px-2 py-0.5 rounded">EmailCampaign-Agent</span>. 
            Continuous compliance for <strong className="text-emerald-400">SOC 2 Type II remains stable at 94%</strong>. 
            There are currently <strong className="text-amber-400">3 pending approvals</strong> approaching SLA breaches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="AI Governance Score" value="92/100" icon={ShieldCheck} trend="up" trendValue="+2 pts" />
        <KpiCard title="Audit Readiness" value="94%" icon={FileText} trend="up" trendValue="SOC 2 & ISO" />
        <KpiCard title="Policy Coverage" value="100%" icon={Activity} trend="neutral" trendValue="All Agents" />
        <KpiCard title="Incident Exposure" value="Low" icon={ShieldCheck} trend="up" trendValue="0 Critical" />
      </div>

      {/* Report Generation Center */}
      <SectionCard title="Executive Reports Center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Presentation size={24} /></div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Weekly Governance Brief</h3>
              <p className="text-sm text-slate-500 mt-1">Summary of agent activity, policy enforcements, and escalations.</p>
            </div>
            <div className="mt-auto w-full pt-4">
              <Button variant="secondary" icon={Download} className="w-full" onClick={() => handleExport("Weekly Governance Brief")}>Download PDF</Button>
            </div>
          </div>
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><FileText size={24} /></div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Compliance Report</h3>
              <p className="text-sm text-slate-500 mt-1">Detailed framework status, control efficacy, and audit evidence map.</p>
            </div>
            <div className="mt-auto w-full pt-4">
              <Button variant="secondary" icon={Download} className="w-full" onClick={() => handleExport("Monthly Compliance Report")}>Download PDF</Button>
            </div>
          </div>
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Activity size={24} /></div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Quarterly Risk Assessment</h3>
              <p className="text-sm text-slate-500 mt-1">Systemic risk trends, macro vulnerabilities, and InfoSec alignment.</p>
            </div>
            <div className="mt-auto w-full pt-4">
              <Button variant="secondary" icon={Download} className="w-full" onClick={() => handleExport("Quarterly Risk Assessment")}>Download PDF</Button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}