import React from 'react';
import { Agent } from './types';
import { X, Shield, Activity, Calendar, FileText, CheckCircle } from 'lucide-react';

interface WorkerDrawerProps {
  worker: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

function WorkerStatusBadge({ status }: { status: string }) {
  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
    inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    paused: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
  };
  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const riskColors = {
    high: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800/50',
    medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
    low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
  };
  const colorClass = riskColors[level as keyof typeof riskColors] || riskColors.low;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
      Risk: {level}
    </span>
  );
}

export default function WorkerDrawer({ worker, isOpen, onClose }: WorkerDrawerProps) {
  if (!isOpen || !worker) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Worker Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{worker.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{worker.description}</p>
            <div className="flex flex-wrap gap-3">
              <WorkerStatusBadge status={worker.status} />
              <RiskBadge level={worker.riskLevel} />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {worker.department}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-slate-500 uppercase">Success Rate</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{worker.successRate}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-500 uppercase">Decisions Today</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{worker.decisionsToday}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" /> Governance & Policies
            </h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Assigned Policies</p>
                <div className="flex flex-wrap gap-2">
                  {worker.assignedPolicies.map((policy, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded text-xs font-medium border border-indigo-100 dark:border-indigo-800/50">
                      <FileText className="h-3 w-3" /> {policy}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Approval Requirements</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  {worker.approvalRequirements}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </h4>
            <div className="relative border-l border-slate-200 dark:border-slate-700 ml-2 space-y-4">
              {[
                { time: '10 mins ago', action: 'Approved refund request for $45.00' },
                { time: '1 hour ago', action: 'Flagged suspicious transaction for human review' },
                { time: '3 hours ago', action: 'Updated customer shipping address' },
              ].map((activity, idx) => (
                <div key={idx} className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[5.5px] top-1.5 border-2 border-white dark:border-slate-900"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
          <button className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Edit Configuration
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
            View Full Logs
          </button>
        </div>

      </div>
    </>
  );
}