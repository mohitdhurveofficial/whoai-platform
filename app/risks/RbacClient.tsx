"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { SectionCard } from "@/app/components/ui/SectionCard";
import { Button } from "@/app/components/ui/Button";
import { Check, Minus, Shield, Users } from "lucide-react";
import { KpiCard } from "@/app/components/ui/KpiCard";

const roles = [
  "Super Admin",
  "Admin",
  "Compliance Officer",
  "Security Officer",
  "Auditor",
  "Viewer"
];

const permissions = [
  { category: "Agent Management", items: ["View Agents", "Create Agents", "Edit Agents", "Disable/Archive Agents"] },
  { category: "Policy Engine", items: ["View Policies", "Create Policies", "Edit Policies", "Delete Policies", "Simulate Policies"] },
  { category: "Approval Workflows", items: ["View Approvals", "Approve/Reject Requests", "Escalate Approvals", "Bypass SLA"] },
  { category: "Audit & Risk", items: ["View Audit Logs", "Export Audit Logs", "View Risk Dashboard", "Acknowledge Risks"] },
  { category: "System", items: ["Manage Users", "Manage Roles", "Configure Integrations", "View Billing"] }
];

// Mock role permission assignment
const hasPermission = (role: string, item: string) => {
  if (role === "Super Admin") return true;
  if (role === "Admin" && item !== "Manage Roles" && item !== "View Billing") return true;
  if (role === "Viewer" && item.startsWith("View")) return true;
  if (role === "Auditor" && (item.startsWith("View") || item === "Export Audit Logs" || item === "Simulate Policies")) return true;
  if (role === "Compliance Officer" && (item.includes("Polic") || item.includes("Audit") || item.includes("Approv") || item.startsWith("View"))) return true;
  if (role === "Security Officer" && (item.includes("Risk") || item.includes("Agent") || item.includes("Approv") || item.startsWith("View"))) return true;
  return false;
};

export function RbacClient() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20 p-6 md:p-10">
      <PageHeader 
        title="Role-Based Access Control" 
        description="Enterprise permissions matrix. Manage roles and access capabilities across the platform." 
        actions={
          <Button variant="primary" icon={Shield}>
            Create Custom Role
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <KpiCard title="Total Roles" value={roles.length} icon={Shield} trend="neutral" trendValue="2 Custom" />
         <KpiCard title="Active Users" value="24" icon={Users} trend="up" trendValue="+3 this month" />
         <KpiCard title="Strict Policies" value="100%" icon={Check} trend="up" trendValue="Fully compliant" />
      </div>

      <SectionCard title="Permissions Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 w-1/4">Capability</th>
                {roles.map(role => (
                  <th key={role} className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissions.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  <tr className="bg-slate-50 dark:bg-slate-900/30">
                    <td colSpan={roles.length + 1} className="px-6 py-3 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((item, iIdx) => (
                    <tr key={iIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item}
                      </td>
                      {roles.map(role => (
                        <td key={role} className="px-4 py-4 text-center">
                          {hasPermission(role, item) ? (
                            <div className="flex justify-center">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center text-slate-300 dark:text-slate-700">
                              <Minus size={16} />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}