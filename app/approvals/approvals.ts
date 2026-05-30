import { Approval } from "../../app/approvals/governance";

export const MOCK_APPROVALS: Approval[] = [
  {
    id: "app_1",
    decisionId: "dec_1",
    requestedAt: new Date().toISOString(),
    status: "Pending",
  },
  {
    id: "app_2",
    decisionId: "dec_2",
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 80000000).toISOString(),
    reviewedBy: "Chief Risk Officer",
    status: "Rejected",
    justification: "Insufficient confidence score for financial action.",
  }
];