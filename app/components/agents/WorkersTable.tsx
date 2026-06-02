import React, { useState } from 'react';
import { AIWorker } from './types';
import WorkerStatusBadge from './WorkerStatusBadge';
import RiskBadge from './RiskBadge';
import { MoreHorizontal, Eye, Pause, Play, Edit, Trash2 } from 'lucide-react';

interface WorkersTableProps {
  workers: AIWorker[];
  isLoading?: boolean;
  onRowClick: (worker: AIWorker) => void;
}

export default function WorkersTable({ workers, isLoading, onRowClick }: WorkersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center p-12 text-center">
        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
          <MoreHorizontal className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No AI workers found</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Get started by creating your first AI worker or adjust your search filters to find existing ones.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Worker Name</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Department</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Risk Level</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Decisions Today</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Success Rate</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Last Activity</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {workers.map((worker) => (
              <tr 
                key={worker.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => onRowClick(worker)}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{worker.name}</div>
                  <div className="text-xs text-slate-500 max-w-[200px] truncate">{worker.description}</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{worker.department}</td>
                <td className="px-6 py-4">
                  <WorkerStatusBadge status={worker.status} />
                </td>
                <td className="px-6 py-4">
                  <RiskBadge level={worker.riskLevel} />
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  {worker.decisionsToday.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  {worker.successRate}%
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  {new Date(worker.lastActivity).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === worker.id ? null : worker.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {openMenuId === worker.id && (
                    <div className="absolute right-6 top-10 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2" onClick={() => { onRowClick(worker); setOpenMenuId(null); }}>
                        <Eye className="h-4 w-4" /> View Details
                      </button>
                      {worker.status === 'Active' ? (
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                          <Pause className="h-4 w-4" /> Pause Worker
                        </button>
                      ) : (
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                          <Play className="h-4 w-4" /> Resume Worker
                        </button>
                      )}
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                        <Edit className="h-4 w-4" /> Edit Configuration
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                        <Trash2 className="h-4 w-4" /> Delete Worker
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Cards */}
      <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
        {workers.map((worker) => (
          <div 
            key={worker.id} 
            className="p-4 space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => onRowClick(worker)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">{worker.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{worker.department}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === worker.id ? null : worker.id);
                }}
                className="p-1 text-slate-400"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <WorkerStatusBadge status={worker.status} />
              <RiskBadge level={worker.riskLevel} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Decisions</p>
                <p className="font-medium text-slate-900 dark:text-white">{worker.decisionsToday}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Success Rate</p>
                <p className="font-medium text-slate-900 dark:text-white">{worker.successRate}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}