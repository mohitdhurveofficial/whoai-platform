import type { ElementType } from "react";

export type IdentityStatus = "Active" | "Dormant" | "Orphaned" | "Suspended";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface IdentityCredential {
  id: string;
  type: "API Key" | "Service Account" | "OAuth Connection";
  name: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Revoked";
  expiresAt: string;
}

export interface IdentitySecret {
  id: string;
  name: string;
  vault: string;
  lastRotated: string;
  status: "Healthy" | "Exposed" | "Needs Rotation";
}

export interface IdentityPermission {
  id: string;
  system: string;
  accessLevel: string;
  type: "System" | "Data" | "Tool";
}

export interface IdentityPolicy {
  id: string;
  name: string;
  enforcement: "Strict" | "Audit";
  status: "Compliant" | "Violation";
  requiresApproval: boolean;
}

export interface IdentityAccessEvent {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  type: "Access" | "Permission Change" | "Credential Rotation";
}

export interface AIIdentity {
  id: string;
  name: string;
  description: string;
  owner: string;
  backupOwner: string;
  escalationContact: string;
  department: string;
  environment: string;
  status: IdentityStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  leastPrivilegeScore: number;
  lastActivity: string;
  registrationDate: string;
  credentials: IdentityCredential[];
  secrets: IdentitySecret[];
  permissions: IdentityPermission[];
  policies: IdentityPolicy[];
  accessHistory: IdentityAccessEvent[];
  riskIndicators: string[];
}

// Approval Types
export type ApprovalStatus = "pending" | "approved" | "rejected" | "Pending" | "Approved" | "Rejected" | "Escalated";

export interface ExtendedApproval {
  id: string;
  request: string;
  agent: string;
  risk: "High Risk" | "Medium Risk" | "Low Risk" | "High" | "Medium" | "Low" | "Critical" | "low" | "medium" | "high";
  requestedAt: string;
  owner: string;
  icon?: ElementType;
  status?: ApprovalStatus;
  sla?: string;
  requester?: string;
  agent_id?: string | number;
  action_type?: string;
  created_at?: string;
  risk_level?: "High Risk" | "Medium Risk" | "Low Risk" | "High" | "Medium" | "Low" | "Critical" | "low" | "medium" | "high";
  policy_impact?: string;
  reviewer?: string;
  reason?: string;
}

// Decision Types
export type FirewallStatus = "Active" | "Inactive" | "Monitoring" | "Escalated" | "Pending Approval" | "Allowed" | "Executed" | "Blocked" | "Violation";
export interface FirewallDecision {
  id: string;
  agentId: string;
  workerName: string;
  workerRole: string;
  department: string;
  action: string;
  decision: "Allowed" | "Blocked" | "Escalated";
  status: FirewallStatus;
  firewallStatus: FirewallStatus;
  timestamp: string;
  createdAt: string;
  confidence: number;
  reason: string;
  reasoning: string;
  requestedResources: string[];
  riskLevel: RiskLevel;
  riskScore: number;
  riskRecommendation: string;
  riskDrivers: string[];
  triggeredPolicies: Array<{
    name: string;
    severity: RiskLevel;
    outcome: "Allowed" | "Blocked" | "Violation" | "Requires Approval";
  }>;
  approvalChain: Array<{
    role: string;
    status: "Approved" | "Rejected" | "Pending";
    comments?: string;
  }>;
  currentApprover?: string;
}
