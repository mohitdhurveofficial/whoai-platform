export type WorkerStatus = 'Active' | 'Paused' | 'Maintenance';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface AIWorker {
  id: string;
  name: string;
  description: string;
  department: string;
  status: WorkerStatus;
  riskLevel: RiskLevel;
  decisionsToday: number;
  successRate: number;
  lastActivity: string;
  assignedPolicies: string[];
  approvalRequirements: string;
}