export type IdentityStatus = "Active" | "Dormant" | "Shadow" | "Archived";
export type ConnectedSystemType = "Database" | "API" | "CRM" | "Cloud" | "Application" | "Tool";

export interface ConnectedSystem {
  id: string;
  name: string;
  type: ConnectedSystemType;
  lastAccessed: string;
}

export interface AccessEvent {
  id: string;
  timestamp: string;
  eventType: "Permission Change" | "Policy Assignment" | "Approval Event" | "Escalation" | "Access";
  action: string;
  system: string;
  details: string;
}

export interface WorkerIdentity {
  id: string;
  name: string;
  description: string;
  owner: string;
  manager: string;
  department: string;
  riskScore: number;
  status: IdentityStatus;
  lastActivity: string;
  creationDate: string;
  lastReviewDate: string;
  connectedSystems: ConnectedSystem[];
  riskFactors: string[];
  policies: string[];
  accessHistory: AccessEvent[];
}

// Risk Event Types
export type RiskSeverity = "Critical" | "High" | "Medium" | "Low";
export type RiskStatus = "Open" | "Investigating" | "Resolved" | "Ignored";
export type WorkerStatus = "Active" | "Paused" | "Dormant" | "Maintenance" | "Archived" | "Error" | "Deploying";

export interface RiskEvent {
  id: string;
  workerName: string;
  workerId: string;
  riskType: string;
  severity: RiskSeverity;
  status: RiskStatus;
  timestamp: string;
  createdAt: string;
  department: string;
  category: string;
  score: number;
  description: string;
  context: string;
  affectedSystems: string[];
  detectedBy: string;
  riskDrivers: string[];
  triggeredPolicies: string[];
  recommendedActions: string[];
}

export interface RiskAlert {
  id: string;
  message: string;
  severity: RiskSeverity;
  timestamp: string;
  workerId: string;
  workerName: string;
}

export interface AIWorker {
  id: string;
  name: string;
  description: string;
  owner: string;
  department: string;
  riskLevel: RiskSeverity;
  riskScore: number;
  status: WorkerStatus;
  platform: string;
  model: string;
  lastActivity: string;
  connectedSystems: number;
  monthlyCost: number;
  memoryUsage: string;
  permissions: string[];
  policies: string[];
  tools: string[];
  recentDecisions: string[];
  recentApprovals: string[];
  createdAt?: string;
}
