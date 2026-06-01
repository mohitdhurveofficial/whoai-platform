import React, { Suspense } from 'react';
import MetricsGrid from './MetricsGrid';
import DecisionChart from './DecisionChart';
import RiskChart from './RiskChart';
import RecentDecisions from './RecentDecisions';
import ApprovalQueue from './ApprovalQueue';
import AuditFeed from './AuditFeed';
import SystemHealth from './SystemHealth';
import { PageHeader } from '@/app/components/ui/PageHeader';

async function DashboardContent() {
  // In production, fetch this dynamically:
  // const dbDecisions = await prisma.decision.findMany({ ... })
  // const dbApprovals = await prisma.approval.findMany({ ... })
  
  // Passing empty properties to trigger the production Empty/Zero States 
  // until the Prisma DB data fetching is wired in.
  const initialMetrics = {
    activeWorkers: 0,
    totalDecisions: 0,
    pendingApprovals: 0,
    riskEvents: 0,
    governanceScore: 100,
  };

  return (
    <div className="space-y-6 pt-6">
      <MetricsGrid data={initialMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DecisionChart data={[]} />
        </div>
        <div>
          <RiskChart data={[]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentDecisions decisions={[]} />
          <ApprovalQueue approvals={[]} />
        </div>
        <div className="space-y-6">
          <SystemHealth status="HEALTHY" />
          <AuditFeed events={[]} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <PageHeader 
        title="Workspace Overview" 
        subtitle="Real-time governance activity and human-in-the-loop approvals." 
      />
      <Suspense fallback={<MetricsGrid isLoading={true} />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}