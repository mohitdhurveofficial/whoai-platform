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

export const metrics = {
  pending: 42,
  approvedToday: 318,
  rejectedToday: 19,
  averageReviewTime: "4m 18s",
  riskSummary: [
    { name: "High Risk Requests", value: 12, fill: "#ef4444" },
    { name: "Medium Risk Requests", value: 21, fill: "#f59e0b" },
    { name: "Low Risk Requests", value: 9, fill: "#22c55e" },
  ],
};
