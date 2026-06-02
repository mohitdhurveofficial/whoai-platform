import type { ExtendedPolicy } from "./types";

export const mockPolicies: ExtendedPolicy[] = [
  {
    id: "POL-001",
    name: "PII Access Policy",
    description: "Governs AI worker access to Personally Identifiable Information.",
    department: "Security",
    owner: "Alex Privacy",
    version: "v2.4",
    status: "Active",
    riskLevel: "Critical",
    enforcementMode: "Block",
    assignedWorkers: 12,
    updatedAt: "May 28, 2026",
    triggerConditions: [
      { field: "data_type", operator: "contains", value: "SSN, DOB, Credit Card" }
    ]
  },
  {
    id: "POL-002",
    name: "Finance Refund Policy",
    description: "Limits automated refunds above designated monetary thresholds.",
    department: "Finance",
    owner: "Sarah Ledger",
    version: "v1.2",
    status: "Review",
    riskLevel: "Medium",
    enforcementMode: "Require Approval",
    assignedWorkers: 4,
    updatedAt: "May 29, 2026",
    triggerConditions: [
      { field: "refund_amount", operator: "greater_than", value: "$500" }
    ]
  },
  {
    id: "POL-003",
    name: "Vendor Payment Policy",
    description: "Controls for external vendor payments and account changes.",
    department: "Procurement",
    owner: "Tom Contracts",
    version: "v3.0",
    status: "Active",
    riskLevel: "High",
    enforcementMode: "Require Approval",
    assignedWorkers: 2,
    updatedAt: "May 25, 2026",
    triggerConditions: [
      { field: "payment_type", operator: "equals", value: "External Wire" }
    ]
  },
  {
    id: "POL-004",
    name: "Customer Data Export Policy",
    description: "Rules for bulk exporting customer data from the CRM.",
    department: "Legal",
    owner: "Emma Compliance",
    version: "v1.0",
    status: "Draft",
    riskLevel: "High",
    enforcementMode: "Audit Only",
    assignedWorkers: 8,
    updatedAt: "May 30, 2026",
    triggerConditions: [
      { field: "action", operator: "equals", value: "Bulk Export" }
    ]
  },
  {
    id: "POL-005",
    name: "Payroll Modification Policy",
    description: "Prevents automated modification of employee payroll records.",
    department: "HR",
    owner: "David Human",
    version: "v4.1",
    status: "Active",
    riskLevel: "Critical",
    enforcementMode: "Block",
    assignedWorkers: 1,
    updatedAt: "May 20, 2026",
    triggerConditions: [
      { field: "system", operator: "equals", value: "Workday" }
    ]
  }
];