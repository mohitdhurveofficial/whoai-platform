"use client";

import React from "react";
import { Button } from "@/app/components/ui/Button";
import type { ExtendedPolicy } from "./types";

interface PolicyEditorProps {
  policy: ExtendedPolicy;
  onCancel: () => void;
  onSave: (updatedPolicy: ExtendedPolicy) => void;
}

export function PolicyEditor({ policy, onCancel, onSave }: PolicyEditorProps) {
  // In a real implementation, we'd use local state for the form fields
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(policy); // Mock save
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 space-y-6 p-6 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Policy Name</label>
          <input type="text" defaultValue={policy.name} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea rows={3} defaultValue={policy.description} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Risk Level</label>
            <select defaultValue={policy.riskLevel} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enforcement</label>
            <select defaultValue={policy.enforcementMode} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
              <option value="Audit Only">Audit Only</option>
              <option value="Require Approval">Require Approval</option>
              <option value="Block">Block</option>
            </select>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mt-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rule Builder Builder functionality goes here in future phases.</p>
          <p className="text-xs text-slate-500">Currently displaying read-only parameters.</p>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">Save Changes</Button>
      </div>
    </form>
  );
}