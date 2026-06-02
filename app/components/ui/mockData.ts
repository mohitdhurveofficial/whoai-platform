import { AIIdentity, FirewallDecision } from "./types";

export const mockIdentities: AIIdentity[] = [
  {
    id: "ID-8801",
    name: "FinBot Integrator",
    description: "Core financial integration worker for payment processing.",
    owner: "Sarah Ledger",
    backupOwner: "Michael Chang",
    escalationContact: "finance-oncall@whoai.com",
    department: "Finance",
    environment: "Production",
    status: "Active",
    riskLevel: "Medium",
    riskScore: 45,
    leastPrivilegeScore: 92,
    lastActivity: "2 mins ago",
    registrationDate: "2025-01-15T08:00:00Z",
    credentials: [
      { id: "CRED-1", type: "API Key", name: "Stripe Production Key", status: "Active", expiresAt: "2026-12-31T00:00:00Z" },
      { id: "CRED-2", type: "Service Account", name: "AWS Fin Role", status: "Expiring Soon", expiresAt: "2026-06-15T00:00:00Z" }
    ],
    secrets: [
      { id: "SEC-1", name: "Stripe_Secret_Key", vault: "AWS Secrets Manager", lastRotated: "2026-01-10T00:00:00Z", status: "Healthy" }
    ],
    permissions: [
      { id: "PERM-1", system: "Stripe API", accessLevel: "Write", type: "System" },
      { id: "PERM-2", system: "Finance DB", accessLevel: "Read", type: "Data" }
    ],
    policies: [
      { id: "POL-1", name: "Require MFA for High-Value Transactions", enforcement: "Strict", status: "Compliant", requiresApproval: true }
    ],
    accessHistory: [
      { id: "AH-1", timestamp: "2026-05-31T18:00:00Z", action: "Read Data", target: "Finance DB", type: "Access" },
      { id: "AH-2", timestamp: "2026-05-30T10:00:00Z", action: "Rotated API Key", target: "Stripe API", type: "Credential Rotation" }
    ],
    riskIndicators: ["Service Account Expiring in 15 Days"]
  },
  {
    id: "ID-8802",
    name: "Legacy Support Agent",
    description: "Deprecated Zendesk integration script.",
    owner: "Unassigned",
    backupOwner: "None",
    escalationContact: "None",
    department: "Support",
    environment: "Staging",
    status: "Orphaned",
    riskLevel: "Critical",
    riskScore: 95,
    leastPrivilegeScore: 20,
    lastActivity: "6 months ago",
    registrationDate: "2023-11-20T08:00:00Z",
    credentials: [
      { id: "CRED-3", type: "OAuth Connection", name: "Zendesk Legacy", status: "Expired", expiresAt: "2025-11-20T00:00:00Z" }
    ],
    secrets: [
      { id: "SEC-2", name: "Zendesk_OAuth_Token", vault: "Local Store", lastRotated: "2023-11-20T00:00:00Z", status: "Needs Rotation" }
    ],
    permissions: [
      { id: "PERM-3", system: "Zendesk API", accessLevel: "Admin", type: "System" },
      { id: "PERM-4", system: "Customer PII DB", accessLevel: "Full Access", type: "Data" }
    ],
    policies: [
      { id: "POL-2", name: "Deprecation Review", enforcement: "Audit", status: "Violation", requiresApproval: false }
    ],
    accessHistory: [
      { id: "AH-3", timestamp: "2025-12-01T12:00:00Z", action: "Failed Authentication", target: "Zendesk API", type: "Access" }
    ],
    riskIndicators: ["Missing Owner", "Over-Permissioned Access", "Expired OAuth Token", "Dormant Identity"]
  }
];

// Mock Firewall Decisions
export const mockFirewallDecisions: FirewallDecision[] = [
  {
    id: "FW-001",
    agentId: "W-001",
    action: "Bulk Refund Request",
    decision: "Escalated",
    status: "Escalated",
    firewallStatus: "Escalated",
    timestamp: "2026-06-01T14:30:00Z",
    createdAt: "2026-06-01T14:30:00Z",
    workerName: "FinBot Integrator",
    workerRole: "Finance Automation Worker",
    department: "Finance",
    confidence: 92,
    reason: "High financial impact - exceeds approval threshold",
    reasoning: "Bulk refund request exceeds finance policy limits and requires human review before execution.",
    requestedResources: ["Stripe Refund API", "Finance Ledger"],
    riskLevel: "High",
    riskScore: 86,
    riskRecommendation: "Route to finance approver before execution.",
    riskDrivers: ["High transaction value", "Bulk customer impact"],
    triggeredPolicies: [
      { name: "Enterprise Discount Guardrail", severity: "High", outcome: "Requires Approval" }
    ],
    approvalChain: [
      { role: "Finance Manager", status: "Pending" }
    ],
    currentApprover: "Finance Manager",
  },
  {
    id: "FW-002",
    agentId: "W-002",
    action: "User Data Access",
    decision: "Allowed",
    status: "Active",
    firewallStatus: "Active",
    timestamp: "2026-06-01T10:15:00Z",
    createdAt: "2026-06-01T10:15:00Z",
    workerName: "SupportOps Copilot",
    workerRole: "Customer Support Worker",
    department: "Support",
    confidence: 98,
    reason: "Policy compliant - standard support access",
    reasoning: "The request matches standard support access policy and uses approved scoped credentials.",
    requestedResources: ["Customer Profile Read"],
    riskLevel: "Low",
    riskScore: 18,
    riskRecommendation: "Allow with standard audit logging.",
    riskDrivers: [],
    triggeredPolicies: [],
    approvalChain: [],
  },
  {
    id: "FW-003",
    agentId: "W-003",
    action: "Cross-Tenant Query",
    decision: "Blocked",
    status: "Inactive",
    firewallStatus: "Inactive",
    timestamp: "2026-05-31T18:00:00Z",
    createdAt: "2026-05-31T18:00:00Z",
    workerName: "Analytics Agent",
    workerRole: "Revenue Analytics Worker",
    department: "Operations",
    confidence: 99,
    reason: "Policy violation - unauthorized cross-tenant access attempt",
    reasoning: "The requested query crosses tenant boundaries and violates data isolation requirements.",
    requestedResources: ["Tenant Analytics Warehouse"],
    riskLevel: "Critical",
    riskScore: 94,
    riskRecommendation: "Block execution and alert security.",
    riskDrivers: ["Cross-tenant scope", "Sensitive customer data"],
    triggeredPolicies: [
      { name: "Tenant Isolation Policy", severity: "Critical", outcome: "Violation" }
    ],
    approvalChain: [
      { role: "Security Review", status: "Rejected", comments: "Cross-tenant access is not permitted." }
    ],
  },
];
