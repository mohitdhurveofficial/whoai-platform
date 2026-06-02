export type PolicyStatus = "Active" | "Draft" | "Review" | "Archived";
export type PolicyRiskLevel = "Low" | "Medium" | "High" | "Critical";
export type EnforcementMode = "Audit Only" | "Require Approval" | "Block";

export interface PolicyCondition {
  field: string;
  operator: string;
  value: string;
}

export interface ExtendedPolicy {
  id: string;
  name: string;
  description: string;
  department: string;
  owner: string;
  version: string;
  status: PolicyStatus;
  riskLevel: PolicyRiskLevel;
  enforcementMode: EnforcementMode;
  assignedWorkers: number;
  updatedAt: string;
  triggerConditions: PolicyCondition[];
}