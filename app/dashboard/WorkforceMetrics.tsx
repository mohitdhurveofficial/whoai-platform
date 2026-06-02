import React from 'react';
import { Users, PauseCircle, Activity, CheckSquare, ShieldCheck } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';

interface MetricsProps {
  activeWorkers: number;
  pausedWorkers: number;
  decisionsToday: number;
  pendingApprovals: number;
  governanceScore: number;
  isLoading?: boolean;
}

export default function WorkforceMetrics({
  activeWorkers,
  pausedWorkers,
  decisionsToday,
  pendingApprovals,
  governanceScore,
  isLoading
}: MetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    { title: 'Active Workers', value: activeWorkers, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
    { title: 'Paused Workers', value: pausedWorkers, icon: PauseCircle, color: 'text-amber-600 dark:text-amber-400' },
    { title: 'Decisions Today', value: decisionsToday.toLocaleString(), icon: Activity, color: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Pending Approvals', value: pendingApprovals, icon: CheckSquare, color: 'text-violet-600 dark:text-violet-400' },
    { title: 'Governance Score', value: `${governanceScore}/100`, icon: ShieldCheck, color: 'text-sky-600 dark:text-sky-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</h3>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
          </Card>
        );
      })}
    </div>
  );
}