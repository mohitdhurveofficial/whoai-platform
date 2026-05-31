import React from 'react';
import { Activity, ShieldAlert, CheckCircle, Bot, ShieldCheck } from 'lucide-react';

export interface MetricsData {
  activeWorkers: number;
  totalDecisions: number;
  pendingApprovals: number;
  riskEvents: number;
  governanceScore: number;
}

interface MetricsGridProps {
  data?: MetricsData;
  isLoading?: boolean;
}

export default function MetricsGrid({ data, isLoading }: MetricsGridProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    { title: 'Active AI Workers', value: data.activeWorkers, icon: Bot, trend: 'Currently active', alert: false },
    { title: 'Total Decisions', value: data.totalDecisions.toLocaleString(), icon: Activity, trend: 'All time', alert: false },
    { title: 'Pending Approvals', value: data.pendingApprovals, icon: CheckCircle, trend: data.pendingApprovals > 0 ? 'Action required' : 'Inbox zero', alert: data.pendingApprovals > 0 },
    { title: 'Risk Events', value: data.riskEvents, icon: ShieldAlert, trend: 'Awaiting resolution', alert: data.riskEvents > 0 },
    { title: 'Governance Score', value: `${data.governanceScore}/100`, icon: ShieldCheck, trend: 'System health', alert: data.governanceScore < 80 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric, idx) => (
        <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.title}</h3>
            <metric.icon className={`h-5 w-5 ${metric.alert ? 'text-amber-500' : 'text-blue-500'}`} />
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
          <p className={`text-sm mt-2 ${metric.alert ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {metric.trend}
          </p>
        </div>
      ))}
    </div>
  );
}