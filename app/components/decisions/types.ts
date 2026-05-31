export type DecisionStatus = "Approved" | "Pending" | "Rejected" | "Escalated";
export type RiskLevel = "Low" | "Medium" | "High";

export interface Decision {
  id: string;
  workerName: string;
  action: string;
  riskLevel: RiskLevel;
  confidence: number;
  status: DecisionStatus;
  createdAt: string;
  policy: string;
  details: string;
  reason?: string;
}