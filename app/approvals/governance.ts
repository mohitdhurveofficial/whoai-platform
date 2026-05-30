

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface Approval {
  id: string;
  decisionId: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: ApprovalStatus;
  justification?: string;
}