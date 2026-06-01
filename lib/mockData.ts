import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  CreditCard,
  DatabaseZap,
  KeyRound,
  ReceiptText,
} from "lucide-react";

export type RiskLevel = "High Risk" | "Medium Risk" | "Low Risk";
export type DecisionStatus = "Approved" | "Pending" | "Rejected";

export type DecisionRecord = {
  id: string;
  agent: string;
  action: string;
  risk: RiskLevel;
  riskScore: number;
  policy: string;
  status: DecisionStatus;
  timestamp: string;
};

export type ApprovalRecord = {
  id: string;
  request: string;
  agent: string;
  risk: RiskLevel;
  requestedAt: string;
  owner: string;
  icon: LucideIcon;
};

export type AgentRecord = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Paused" | "Archived";
  riskLevel: "High" | "Medium" | "Low";
  lastActivity: string;
  policies: string[];
  decisions: number;
  approvalRate: number;
};

export type PolicyRecord = {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Paused" | "Draft";
  lastUpdated: string;
  assignedAgents: number;
};

export type AuditLogRecord = {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  policy: string;
  outcome: string;
  detail: string;
};

export type ActivityEvent = {
  id: string;
  title: string;
  description: string;
  time: string;
  outcome: string;
  icon: LucideIcon;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type RiskBucket = {
  name: string;
  value: number;
  color: string;
};

export const decisions: DecisionRecord[] = [
  {
    id: "DEC-10482",
    agent: "Revenue Ops Agent",
    action: "Pricing Override",
    risk: "High Risk",
    riskScore: 91,
    policy: "Enterprise Discount Guardrail",
    status: "Pending",
    timestamp: "May 30, 2026 10:42 AM",
  },
  {
    id: "DEC-10481",
    agent: "Support Resolution Agent",
    action: "Refund Approval",
    risk: "Medium Risk",
    riskScore: 64,
    policy: "Refund Threshold Policy",
    status: "Approved",
    timestamp: "May 30, 2026 10:36 AM",
  },
  {
    id: "DEC-10480",
    agent: "Data Privacy Agent",
    action: "Delete Customer Data",
    risk: "High Risk",
    riskScore: 96,
    policy: "GDPR Data Deletion Control",
    status: "Rejected",
    timestamp: "May 30, 2026 10:28 AM",
  },
  {
    id: "DEC-10479",
    agent: "Developer Platform Agent",
    action: "API Access Request",
    risk: "Medium Risk",
    riskScore: 58,
    policy: "Scoped API Access",
    status: "Approved",
    timestamp: "May 30, 2026 10:19 AM",
  },
  {
    id: "DEC-10478",
    agent: "Payments Agent",
    action: "External Payment",
    risk: "High Risk",
    riskScore: 88,
    policy: "External Transfer Approval",
    status: "Pending",
    timestamp: "May 30, 2026 10:11 AM",
  },
  {
    id: "DEC-10477",
    agent: "Procurement Agent",
    action: "Vendor Contract Update",
    risk: "Medium Risk",
    riskScore: 52,
    policy: "Vendor Change Review",
    status: "Approved",
    timestamp: "May 30, 2026 9:58 AM",
  },
  {
    id: "DEC-10476",
    agent: "CRM Agent",
    action: "Export Account List",
    risk: "Medium Risk",
    riskScore: 61,
    policy: "Customer Data Export",
    status: "Approved",
    timestamp: "May 30, 2026 9:45 AM",
  },
  {
    id: "DEC-10475",
    agent: "Marketing Agent",
    action: "Launch Campaign",
    risk: "Low Risk",
    riskScore: 24,
    policy: "Brand Safety Review",
    status: "Approved",
    timestamp: "May 30, 2026 9:34 AM",
  },
  {
    id: "DEC-10474",
    agent: "Finance Agent",
    action: "Invoice Adjustment",
    risk: "Medium Risk",
    riskScore: 47,
    policy: "Finance Adjustment Limits",
    status: "Approved",
    timestamp: "May 30, 2026 9:22 AM",
  },
  {
    id: "DEC-10473",
    agent: "Security Agent",
    action: "Rotate Production Key",
    risk: "High Risk",
    riskScore: 82,
    policy: "Credential Rotation Policy",
    status: "Approved",
    timestamp: "May 30, 2026 9:08 AM",
  },
  {
    id: "DEC-10472",
    agent: "HR Assistant",
    action: "Access Employee Record",
    risk: "High Risk",
    riskScore: 86,
    policy: "Employee PII Access",
    status: "Rejected",
    timestamp: "May 30, 2026 8:57 AM",
  },
  {
    id: "DEC-10471",
    agent: "Billing Agent",
    action: "Retry Failed Payment",
    risk: "Low Risk",
    riskScore: 19,
    policy: "Payment Retry Limits",
    status: "Approved",
    timestamp: "May 30, 2026 8:41 AM",
  },
  {
    id: "DEC-10470",
    agent: "Knowledge Agent",
    action: "Publish Internal Answer",
    risk: "Low Risk",
    riskScore: 17,
    policy: "Internal Content Policy",
    status: "Approved",
    timestamp: "May 30, 2026 8:31 AM",
  },
  {
    id: "DEC-10469",
    agent: "Customer Success Agent",
    action: "Apply Renewal Credit",
    risk: "Medium Risk",
    riskScore: 55,
    policy: "Renewal Incentive Policy",
    status: "Pending",
    timestamp: "May 30, 2026 8:16 AM",
  },
  {
    id: "DEC-10468",
    agent: "Legal Review Agent",
    action: "Share Contract Clause",
    risk: "Medium Risk",
    riskScore: 49,
    policy: "Legal Disclosure Control",
    status: "Approved",
    timestamp: "May 30, 2026 7:59 AM",
  },
  {
    id: "DEC-10467",
    agent: "Trust & Safety Agent",
    action: "Suspend User Account",
    risk: "High Risk",
    riskScore: 90,
    policy: "Account Enforcement Policy",
    status: "Pending",
    timestamp: "May 30, 2026 7:44 AM",
  },
  {
    id: "DEC-10466",
    agent: "Analytics Agent",
    action: "Query Revenue Warehouse",
    risk: "Low Risk",
    riskScore: 28,
    policy: "Warehouse Query Limits",
    status: "Approved",
    timestamp: "May 30, 2026 7:28 AM",
  },
  {
    id: "DEC-10465",
    agent: "Ops Agent",
    action: "Update Incident Status",
    risk: "Low Risk",
    riskScore: 21,
    policy: "Incident Workflow Policy",
    status: "Approved",
    timestamp: "May 30, 2026 7:14 AM",
  },
  {
    id: "DEC-10464",
    agent: "Sales Agent",
    action: "Send Enterprise Proposal",
    risk: "Medium Risk",
    riskScore: 45,
    policy: "Proposal Review Policy",
    status: "Approved",
    timestamp: "May 30, 2026 6:55 AM",
  },
  {
    id: "DEC-10463",
    agent: "Infrastructure Agent",
    action: "Scale Production Cluster",
    risk: "High Risk",
    riskScore: 79,
    policy: "Production Change Control",
    status: "Approved",
    timestamp: "May 30, 2026 6:37 AM",
  },
  {
    id: "DEC-10462",
    agent: "Support Resolution Agent",
    action: "Refund Approval",
    risk: "Low Risk",
    riskScore: 33,
    policy: "Refund Threshold Policy",
    status: "Approved",
    timestamp: "May 30, 2026 6:20 AM",
  },
  {
    id: "DEC-10461",
    agent: "Developer Platform Agent",
    action: "Create API Token",
    risk: "Medium Risk",
    riskScore: 59,
    policy: "Scoped API Access",
    status: "Rejected",
    timestamp: "May 30, 2026 6:04 AM",
  },
];

export const approvals: ApprovalRecord[] = [
  {
    id: "APR-9021",
    request: "Approve external payment of $48,500 to vendor",
    agent: "Payments Agent",
    risk: "High Risk",
    requestedAt: "May 30, 2026 10:46 AM",
    owner: "Finance Review",
    icon: CreditCard,
  },
  {
    id: "APR-9020",
    request: "Delete inactive customer data under GDPR request",
    agent: "Data Privacy Agent",
    risk: "High Risk",
    requestedAt: "May 30, 2026 10:39 AM",
    owner: "Privacy Ops",
    icon: DatabaseZap,
  },
  {
    id: "APR-9019",
    request: "Override enterprise pricing for strategic renewal",
    agent: "Revenue Ops Agent",
    risk: "Medium Risk",
    requestedAt: "May 30, 2026 10:27 AM",
    owner: "Revenue Desk",
    icon: BadgeDollarSign,
  },
  {
    id: "APR-9018",
    request: "Grant temporary API access to partner workspace",
    agent: "Developer Platform Agent",
    risk: "Medium Risk",
    requestedAt: "May 30, 2026 10:18 AM",
    owner: "Platform Security",
    icon: KeyRound,
  },
  {
    id: "APR-9017",
    request: "Approve refund above automated threshold",
    agent: "Support Resolution Agent",
    risk: "Low Risk",
    requestedAt: "May 30, 2026 9:54 AM",
    owner: "Support QA",
    icon: ReceiptText,
  },
];

export const agents: AgentRecord[] = [
  {
    id: "agent-1",
    name: "Revenue Ops Agent",
    owner: "Revenue Desk",
    status: "Active",
    riskLevel: "High",
    lastActivity: "2 minutes ago",
    policies: ["Discount Policy", "Fraud Guardrail"],
    decisions: 72,
    approvalRate: 84,
  },
  {
    id: "agent-2",
    name: "Data Privacy Agent",
    owner: "Privacy Ops",
    status: "Active",
    riskLevel: "High",
    lastActivity: "5 minutes ago",
    policies: ["GDPR Control", "Data Retention"],
    decisions: 56,
    approvalRate: 77,
  },
  {
    id: "agent-3",
    name: "Support Resolution Agent",
    owner: "Support QA",
    status: "Active",
    riskLevel: "Medium",
    lastActivity: "12 minutes ago",
    policies: ["Refund Threshold", "Customer Safety"],
    decisions: 132,
    approvalRate: 92,
  },
  {
    id: "agent-4",
    name: "Developer Platform Agent",
    owner: "Platform Security",
    status: "Active",
    riskLevel: "Medium",
    lastActivity: "18 minutes ago",
    policies: ["API Access", "Credential Management"],
    decisions: 98,
    approvalRate: 89,
  },
  {
    id: "agent-5",
    name: "Finance Agent",
    owner: "Corporate Finance",
    status: "Paused",
    riskLevel: "Low",
    lastActivity: "48 minutes ago",
    policies: ["Payment Approval", "Invoice Control"],
    decisions: 64,
    approvalRate: 95,
  },
];

export const policies: PolicyRecord[] = [
  {
    id: "policy-1",
    name: "Enterprise Discount Guardrail",
    category: "Finance",
    status: "Active",
    lastUpdated: "May 29, 2026",
    assignedAgents: 3,
  },
  {
    id: "policy-2",
    name: "GDPR Data Deletion Control",
    category: "Privacy",
    status: "Active",
    lastUpdated: "May 28, 2026",
    assignedAgents: 2,
  },
  {
    id: "policy-3",
    name: "Refund Threshold Policy",
    category: "Customer Service",
    status: "Active",
    lastUpdated: "May 27, 2026",
    assignedAgents: 1,
  },
  {
    id: "policy-4",
    name: "Scoped API Access",
    category: "Security",
    status: "Active",
    lastUpdated: "May 25, 2026",
    assignedAgents: 2,
  },
  {
    id: "policy-5",
    name: "Vendor Change Review",
    category: "Procurement",
    status: "Paused",
    lastUpdated: "May 23, 2026",
    assignedAgents: 1,
  },
];

export const auditLogs: AuditLogRecord[] = [
  {
    id: "log-1",
    timestamp: "May 30, 2026 10:46 AM",
    event: "Approval requested",
    actor: "Finance Review",
    policy: "External Transfer Approval",
    outcome: "Pending",
    detail: "External payment requires human review after threshold breach.",
  },
  {
    id: "log-2",
    timestamp: "May 30, 2026 10:39 AM",
    event: "Policy violation detected",
    actor: "Data Privacy Agent",
    policy: "GDPR Data Deletion Control",
    outcome: "Escalated",
    detail: "Customer deletion request triggers privacy review.",
  },
  {
    id: "log-3",
    timestamp: "May 30, 2026 10:27 AM",
    event: "Decision approved",
    actor: "Revenue Desk",
    policy: "Enterprise Discount Guardrail",
    outcome: "Approved",
    detail: "Strategic renewal pricing override granted.",
  },
  {
    id: "log-4",
    timestamp: "May 30, 2026 10:18 AM",
    event: "Access request evaluated",
    actor: "Platform Security",
    policy: "Scoped API Access",
    outcome: "Approved",
    detail: "Temporary partner access granted for integration.",
  },
  {
    id: "log-5",
    timestamp: "May 30, 2026 9:54 AM",
    event: "Refund review submitted",
    actor: "Support QA",
    policy: "Refund Threshold Policy",
    outcome: "Pending",
    detail: "Request exceeds automated refund limits.",
  },
];

export const activityFeed: ActivityEvent[] = [
  {
    id: "activity-1",
    title: "High-risk payment request queued",
    description: "Payments Agent submitted an external transfer that requires executive review.",
    time: "2 minutes ago",
    outcome: "Pending",
    icon: CreditCard,
  },
  {
    id: "activity-2",
    title: "Privacy policy triggered",
    description: "Data Privacy Agent detected a GDPR deletion request during runtime.",
    time: "8 minutes ago",
    outcome: "Escalated",
    icon: DatabaseZap,
  },
  {
    id: "activity-3",
    title: "Revenue override approved",
    description: "Revenue Ops Agent received sign-off for a strategic pricing exception.",
    time: "15 minutes ago",
    outcome: "Approved",
    icon: BadgeDollarSign,
  },
  {
    id: "activity-4",
    title: "API access scope validated",
    description: "Developer Platform Agent requested partner access under platform controls.",
    time: "22 minutes ago",
    outcome: "Approved",
    icon: KeyRound,
  },
  {
    id: "activity-5",
    title: "Customer refund flagged",
    description: "Support Resolution Agent submitted an above-threshold refund request.",
    time: "38 minutes ago",
    outcome: "Pending",
    icon: ReceiptText,
  },
];

export const dashboardMetrics = {
  overview: [
    { label: "Governance Score", value: "92.4", detail: "Stable compliance across all agents." },
    { label: "Active Agents", value: 18, detail: "Active workflows running now." },
    { label: "Pending Approvals", value: 14, detail: "Decisions awaiting manual review." },
    { label: "High Risk Decisions", value: 8, detail: "Priority items flagged by policies." },
    { label: "Policy Violations", value: 4, detail: "Recent guardrail breaches." },
    { label: "Decisions Today", value: 224, detail: "AI decisions processed this session." },
  ],
  trend: [
    { label: "Mon", value: 32 },
    { label: "Tue", value: 38 },
    { label: "Wed", value: 44 },
    { label: "Thu", value: 52 },
    { label: "Fri", value: 48 },
    { label: "Sat", value: 38 },
    { label: "Sun", value: 52 },
  ] as TrendPoint[],
  riskDistribution: [
    { name: "High Risk", value: 8, color: "#ef4444" },
    { name: "Medium Risk", value: 21, color: "#f59e0b" },
    { name: "Low Risk", value: 13, color: "#22c55e" },
  ] as RiskBucket[],
};

export const recentDecisions = decisions.slice(0, 5);

export const policyCards = policies;

export const approvalQueue = approvals;

export const auditTimeline = auditLogs;

export const systemActivity = activityFeed;
