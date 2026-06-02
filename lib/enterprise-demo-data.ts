/**
 * Enterprise Demo Data for WHOAI SaaS Platform
 * 
 * Generates realistic, interconnected data representing:
 * - 25 AI agents across 10 departments
 * - 1000+ decisions with risk scores and outcomes
 * - 200 approvals with decision references
 * - 100+ incidents with root cause analysis
 * - 50 policies with compliance mappings
 * - Cross-linked evidence and audit trails
 * \n * This data simulates 6-12 months of AI governance operations
 * in a complex enterprise with multiple departments and risk profiles.
 */

// ============================================================================
// TYPES
// ============================================================================

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ApprovalStatus = "Approved" | "Pending" | "Rejected" | "Escalated";
export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type DepartmentName = 
  | "Revenue Operations"
  | "Finance"
  | "Security & Compliance"
  | "HR & Talent"
  | "Customer Success"
  | "Product Engineering"
  | "Data & Analytics"
  | "Legal"
  | "Operations"
  | "Marketing";

export type ComplianceFramework = "SOC2" | "ISO27001" | "HIPAA" | "GDPR" | "CCPA" | "EU-AI-Act";

export interface Agent {
  id: string;
  name: string;
  department: DepartmentName;
  description: string;
  status: "Active" | "Paused" | "Archived";
  riskLevel: RiskLevel;
  decisionsCount: number;
  approvalsRequired: number;
  approvalRate: number;
  incidentCount: number;
  lastDecisionAt: Date;
  createdAt: Date;
  owner: string;
  capabilities: string[];
}

export interface Decision {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  confidenceScore: number; // 0-100
  status: ApprovalStatus;
  policyId: string;
  policyName: string;
  timestamp: Date;
  explanation: string;
  affectedEntity: {
    type: "user" | "account" | "transaction" | "resource";
    id: string;
    name: string;
  };
  impactValue?: number; // Monetary or other quantifiable impact
  incidentId?: string; // If this decision triggered an incident
}

export interface Approval {
  id: string;
  decisionId: string;
  agentId: string;
  agentName: string;
  requestedAt: Date;
  approverName: string;
  approverId: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  resolvedAt?: Date;
  resolutionTime?: number; // minutes
  reason?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: Date;
  resolvedAt?: Date;
  resolutionTime?: number; // minutes
  rootCauseAgentId: string;
  rootCauseAgentName: string;
  violatedPolicies: string[];
  affectedDecisions: string[];
  impactSummary: string;
  assignedTo: string;
  investigationNotes: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  category: string;
  complianceFrameworks: ComplianceFramework[];
  status: "Active" | "Draft" | "Archived";
  createdAt: Date;
  lastUpdatedAt: Date;
  appliedAgents: string[];
  violationCount: number;
  riskLevel: RiskLevel;
  rules: string[];
}

export interface ComplianceEvidence {
  id: string;
  policyId: string;
  incidentId?: string;
  decisionId?: string;
  framework: ComplianceFramework;
  evidenceType: "audit_log" | "decision_record" | "approval_chain" | "incident_resolution";
  timestamp: Date;
  description: string;
  fileUrl?: string;
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

const DEPARTMENTS: DepartmentName[] = [
  "Revenue Operations",
  "Finance",
  "Security & Compliance",
  "HR & Talent",
  "Customer Success",
  "Product Engineering",
  "Data & Analytics",
  "Legal",
  "Operations",
  "Marketing",
];

const FRAMEWORKS: ComplianceFramework[] = ["SOC2", "ISO27001", "HIPAA", "GDPR", "CCPA", "EU-AI-Act"];

const POLICY_CATEGORIES = [
  "Financial Controls",
  "Access Management",
  "Data Protection",
  "User Privacy",
  "Fraud Prevention",
  "Audit & Compliance",
  "Hiring & Onboarding",
  "Customer Data",
  "Risk Management",
  "Operational Security",
];

const AGENT_NAMES = [
  "Revenue Ops Agent",
  "Pricing Optimizer",
  "Fraud Detection Agent",
  "Access Control Agent",
  "Compliance Monitor",
  "Onboarding Agent",
  "Customer Support Agent",
  "Payment Processor",
  "Data Classification Agent",
  "Security Incident Responder",
  "Contract Reviewer",
  "Risk Scorer",
  "Approval Workflow Agent",
  "Audit Logger",
  "Policy Enforcer",
  "Identity Validator",
  "Threat Detector",
  "Remediation Agent",
  "Escalation Handler",
  "Decision Logger",
  "Evidence Collector",
  "Training System",
  "Anomaly Detector",
  "Recommendation Engine",
  "Integration Orchestrator",
];

const ACTIONS = [
  "User Access Grant",
  "Discount Override",
  "Refund Approval",
  "Data Export Request",
  "Security Exception",
  "Policy Waiver",
  "Rate Limit Increase",
  "Feature Unlock",
  "Account Suspension",
  "Password Reset",
  "Payment Authorization",
  "Contract Modification",
  "API Key Rotation",
  "Encryption Override",
  "Compliance Audit",
];

const DECISION_EXPLANATIONS = [
  "Risk assessment based on user behavior patterns and historical approval trends.",
  "Policy evaluation against current transaction context and compliance requirements.",
  "ML model confidence score combined with rule-based risk scoring.",
  "Multi-factor risk analysis: transaction value, user history, and policy constraints.",
  "Behavioral analysis detected anomalies requiring elevated scrutiny.",
  "Pattern matching against known fraud vectors and suspicious activity indicators.",
  "Approval routing based on risk tier and policy requirements.",
  "Automated escalation triggered by policy violation threshold.",
  "Decision made within governance boundaries with high confidence.",
  "Conservative approach due to conflicting policy requirements.",
];

const APPROVERS = [
  "Sarah Chen",
  "Michael Rodriguez",
  "Jennifer Park",
  "David Thompson",
  "Emily Watson",
  "James Miller",
  "Lisa Anderson",
  "Robert Wilson",
  "Maria Garcia",
  "William Davis",
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

function generateRiskScore(): number {
  // Skewed distribution: more low-risk scores
  const rand = Math.random();
  if (rand < 0.5) return Math.floor(Math.random() * 30); // Low: 0-30
  if (rand < 0.8) return Math.floor(Math.random() * 40 + 30); // Medium: 30-70
  return Math.floor(Math.random() * 30 + 70); // High/Critical: 70-100
}

function riskScoreToLevel(score: number): RiskLevel {
  if (score < 30) return "Low";
  if (score < 60) return "Medium";
  if (score < 80) return "High";
  return "Critical";
}

function generateRandomDate(daysAgo: number = 180): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return pastDate;
}

// ============================================================================
// DATA GENERATION FUNCTIONS
// ============================================================================

export function generateAgents(count: number = 25): Agent[] {
  const agents: Agent[] = [];
  const agentNames = getRandomElements(AGENT_NAMES, count);

  for (let i = 0; i < count; i++) {
    const riskScore = generateRiskScore();
    agents.push({
      id: `AGENT-${String(i + 1).padStart(4, "0")}`,
      name: agentNames[i],
      department: getRandomElement(DEPARTMENTS),
      description: `AI agent responsible for ${agentNames[i].toLowerCase()} operations.`,
      status: Math.random() > 0.1 ? "Active" : "Paused",
      riskLevel: riskScoreToLevel(riskScore),
      decisionsCount: Math.floor(Math.random() * 150) + 20,
      approvalsRequired: Math.random() > 0.5 ? 1 : 0,
      approvalRate: Math.floor(Math.random() * 40) + 70,
      incidentCount: Math.floor(Math.random() * 15),
      lastDecisionAt: generateRandomDate(30),
      createdAt: generateRandomDate(180),
      owner: getRandomElement(APPROVERS),
      capabilities: getRandomElements([
        "decision_making",
        "data_processing",
        "access_control",
        "fraud_detection",
        "compliance_checking",
        "user_validation",
        "risk_scoring",
      ], Math.floor(Math.random() * 4) + 2),
    });
  }

  return agents;
}

export function generatePolicies(count: number = 50, frameworks: ComplianceFramework[] = FRAMEWORKS): Policy[] {
  const policies: Policy[] = [];

  for (let i = 0; i < count; i++) {
    policies.push({
      id: `POL-${String(i + 1).padStart(4, "0")}`,
      name: `${getRandomElement(POLICY_CATEGORIES)} Policy ${i + 1}`,
      description: `Policy governing ${getRandomElement(POLICY_CATEGORIES).toLowerCase()} operations.`,
      category: getRandomElement(POLICY_CATEGORIES),
      complianceFrameworks: getRandomElements(frameworks, Math.floor(Math.random() * 3) + 1),
      status: Math.random() > 0.1 ? "Active" : "Draft",
      createdAt: generateRandomDate(180),
      lastUpdatedAt: generateRandomDate(90),
      appliedAgents: [`AGENT-${String(Math.floor(Math.random() * 25) + 1).padStart(4, "0")}`, `AGENT-${String(Math.floor(Math.random() * 25) + 1).padStart(4, "0")}`],
      violationCount: Math.floor(Math.random() * 25),
      riskLevel: riskScoreToLevel(generateRiskScore()),
      rules: [
        "Rule: Decisions with risk score > 70 require escalation",
        "Rule: All financial transactions > $50,000 need approval",
        "Rule: Critical data access requires 2FA",
      ],
    });
  }

  return policies;
}

export function generateDecisions(agents: Agent[], policies: Policy[], count: number = 1000): Decision[] {
  const decisions: Decision[] = [];

  for (let i = 0; i < count; i++) {
    const agent = getRandomElement(agents);
    const policy = getRandomElement(policies);
    const riskScore = generateRiskScore();

    decisions.push({
      id: `DEC-${String(i + 1).padStart(6, "0")}`,
      agentId: agent.id,
      agentName: agent.name,
      action: getRandomElement(ACTIONS),
      riskScore,
      riskLevel: riskScoreToLevel(riskScore),
      confidenceScore: Math.floor(Math.random() * 40) + 60,
      status: Math.random() > 0.15 ? "Approved" : Math.random() > 0.5 ? "Pending" : "Rejected",
      policyId: policy.id,
      policyName: policy.name,
      timestamp: generateRandomDate(180),
      explanation: getRandomElement(DECISION_EXPLANATIONS),
      affectedEntity: {
        type: getRandomElement<"user" | "account" | "transaction" | "resource">(["user", "account", "transaction", "resource"]),
        id: `ENT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        name: `Entity ${Math.floor(Math.random() * 10000)}`,
      },
      impactValue: Math.random() > 0.6 ? Math.floor(Math.random() * 1000000) : undefined,
      incidentId: Math.random() > 0.95 ? `INC-${String(Math.floor(Math.random() * 100) + 1).padStart(4, "0")}` : undefined,
    });
  }

  return decisions;
}

export function generateApprovals(decisions: Decision[], count: number = 200): Approval[] {
  const approvals: Approval[] = [];
  // Filter decisions that need approval
  const pendingDecisions = decisions.filter(d => d.status === "Pending").slice(0, count);

  for (let i = 0; i < Math.min(count, pendingDecisions.length); i++) {
    const decision = pendingDecisions[i];
    const approverName = getRandomElement(APPROVERS);
    const requestedAt = decision.timestamp;
    const resolvedAt = Math.random() > 0.3 ? new Date(requestedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined;

    approvals.push({
      id: `APP-${String(i + 1).padStart(5, "0")}`,
      decisionId: decision.id,
      agentId: decision.agentId,
      agentName: decision.agentName,
      requestedAt,
      approverName,
      approverId: `USER-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: resolvedAt ? (Math.random() > 0.2 ? "Approved" : "Rejected") : "Pending",
      riskLevel: decision.riskLevel,
      resolvedAt,
      resolutionTime: resolvedAt ? Math.floor((resolvedAt.getTime() - requestedAt.getTime()) / 60000) : undefined,
      reason: Math.random() > 0.7 ? "Approved per policy guardrails" : undefined,
    });
  }

  return approvals;
}

export function generateIncidents(agents: Agent[], policies: Policy[], decisions: Decision[], count: number = 100): Incident[] {
  const incidents: Incident[] = [];

  for (let i = 0; i < count; i++) {
    const agent = getRandomElement(agents);
    const severity = getRandomElement<IncidentSeverity>(["Low", "Medium", "High", "Critical"]);
    const createdAt = generateRandomDate(180);
    const resolvedAt = Math.random() > 0.3 ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined;

    incidents.push({
      id: `INC-${String(i + 1).padStart(4, "0")}`,
      title: `${severity} Risk: ${getRandomElement(POLICY_CATEGORIES)} Policy Violation`,
      description: `Incident detected involving agent ${agent.name} and policy violations.`,
      severity,
      status: resolvedAt ? (Math.random() > 0.2 ? "Resolved" : "Closed") : "Open",
      createdAt,
      resolvedAt,
      resolutionTime: resolvedAt ? Math.floor((resolvedAt.getTime() - createdAt.getTime()) / 60000) : undefined,
      rootCauseAgentId: agent.id,
      rootCauseAgentName: agent.name,
      violatedPolicies: getRandomElements(policies.map(p => p.id), 1 + Math.floor(Math.random() * 3)),
      affectedDecisions: getRandomElements(decisions.map(d => d.id), 1 + Math.floor(Math.random() * 5)),
      impactSummary: `Potential exposure of ${severity.toLowerCase()} severity affecting governance posture.`,
      assignedTo: getRandomElement(APPROVERS),
      investigationNotes: "Root cause identified. Remediation in progress.",
    });
  }

  return incidents;
}

export function generateComplianceEvidence(
  policies: Policy[],
  incidents: Incident[],
  decisions: Decision[],
  count: number = 200
): ComplianceEvidence[] {
  const evidence: ComplianceEvidence[] = [];

  for (let i = 0; i < count; i++) {
    const policy = getRandomElement(policies);
    const framework = getRandomElement(policy.complianceFrameworks);
    const type = getRandomElement<"audit_log" | "decision_record" | "approval_chain" | "incident_resolution">(
      ["audit_log", "decision_record", "approval_chain", "incident_resolution"]
    );

    evidence.push({
      id: `EVD-${String(i + 1).padStart(5, "0")}`,
      policyId: policy.id,
      incidentId: Math.random() > 0.6 ? getRandomElement(incidents).id : undefined,
      decisionId: Math.random() > 0.6 ? getRandomElement(decisions).id : undefined,
      framework,
      evidenceType: type,
      timestamp: generateRandomDate(180),
      description: `${framework} compliance evidence: ${type.replace("_", " ")}`,
      fileUrl: `/evidence/${framework.toLowerCase()}/${i + 1}.pdf`,
    });
  }

  return evidence;
}

// ============================================================================
// EXPORT GENERATED DATA
// ============================================================================

export function generateEnterpriseDemoData() {
  console.log("🚀 Generating enterprise demo data...");

  const agents = generateAgents(25);
  const policies = generatePolicies(50);
  const decisions = generateDecisions(agents, policies, 1000);
  const approvals = generateApprovals(decisions, 200);
  const incidents = generateIncidents(agents, policies, decisions, 100);
  const evidence = generateComplianceEvidence(policies, incidents, decisions, 200);

  console.log("✅ Demo data generated:");
  console.log(`   - ${agents.length} AI agents`);
  console.log(`   - ${policies.length} policies`);
  console.log(`   - ${decisions.length} decisions`);
  console.log(`   - ${approvals.length} approvals`);
  console.log(`   - ${incidents.length} incidents`);
  console.log(`   - ${evidence.length} compliance evidence records`);

  return {
    agents,
    policies,
    decisions,
    approvals,
    incidents,
    evidence,
    timestamp: new Date(),
    version: "1.0.0",
  };
}
