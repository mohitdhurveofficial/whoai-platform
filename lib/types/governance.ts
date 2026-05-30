export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export type Decision = {
  id: string;
  agentId: string;
  agent: string;
  action: string;
  description: string;
  riskScore: number;
  confidenceScore: number;
  approvalStatus: ApprovalStatus;
  timestamp: string;
  policyImpact: string[];
};
